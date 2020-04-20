import _ from 'lodash';
import HttpErrors from '../extensions/http-errors.js';
import ERRORS from '../extensions/error-meta.js';
import generateTOTP from '../../modules/otp/generate-totp.js';
import verifyTOTP from '../../modules/otp/verify-totp.js';
import { sendOtpMail } from '../../modules/mail/send-otp-mail.js';
import * as customerModel from '../../models/customer-model.js';
import * as accountModel from '../../models/account-model.js';
import * as transferModel from '../../models/transfer-model.js';
import * as debtModel from '../../models/debt-model.js';
import * as currencyModel from '../../models/currency-model.js';
import TRANSFER_TYPES from '../../models/constants/transfer-types.js';
import linkedBankBankingApiModules from '../../modules/linked-banks/banking-api-modules.js';
import logger from '../../modules/logger/logger.js';
import { notifyDebtPaid } from '../../modules/realtime-notifications/customer-notifications.js';

export const createTransfer = async (req, res) => {
    const { type: transferType } = req.query;

    switch (transferType) {
        case 'intrabank':
            await createIntrabankTransfer(req, res);
        case 'interbank':
            await createInterbankTransfer(req, res);
        case 'paydebt':
            await createPayDebtTransfer(req, res);
        default:
            throw new HttpErrors.BadRequest();
    }
};

export const confirmTransfer = async (req, res) => {
    const { type: transferType } = req.query;

    switch (transferType) {
        case 'intrabank':
            await confirmIntrabankTransfer(req, res);
        case 'interbank':
            await confirmInterbankTransfer(req, res);
        case 'paydebt':
            await confirmPayDebtTransfer(req, res);
        default:
            throw new HttpErrors.BadRequest();
    }
};

export const getTransfer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;

    const transfer = await transferModel.getTransferById(transferId);
    if (customerId !== transfer.customerId) throw new HttpErrors.Forbidden();

    const compactTransfer = _.omit(transfer, ['otp']);
    return res.status(200).json({
        transfer: compactTransfer
    });
};

async function createIntrabankTransfer(req, res) {
    const { userId: customerId } = req.auth;
    const { fromAccountNumber, toAccountNumber, amount, message, whoPayFee } = req.body;

    const customer = await customerModel.getByAccountNumber(fromAccountNumber);
    if (!customer) throw new HttpErrors.BadRequest();
    if (customer.id !== customerId) throw new HttpErrors.Forbidden();

    const otp = generateTOTP(customer.otpSecret);
    const createdTransfer = await transferModel.createIntrabankTransfer({
        customerId,
        fromAccountNumber,
        toAccountNumber,
        amount,
        message,
        otp,
        whoPayFee
    });

    await sendOtpMail({ customerName: customer.fullName, toEmail: customer.email, otp: otp });

    return res.status(201).json({
        transfer: _.omit(createdTransfer, ['otp'])
    });
};

async function createInterbankTransfer(req, res) {
    const { userId: customerId } = req.auth;
    const { fromAccountNumber, toAccountNumber, toBankId, amount, message, whoPayFee } = req.body;

    const customer = await customerModel.getByAccountNumber(fromAccountNumber);
    if (!customer) throw new HttpErrors.BadRequest();
    if (customer.id !== customerId) throw new HttpErrors.Forbidden();

    const otp = generateTOTP(customer.secret);
    const createdTransfer = await transferModel.createInterbankTransfer({
        customerId,
        fromAccountNumber,
        toAccountNumber,
        toBankId,
        amount,
        message,
        otp,
        whoPayFee
    });
    await sendOtpMail({ customerName: customer.fullName, toEmail: customer.email, otp: generatedOtp });

    return res.status(201).json({
        transfer: _.omit(createdTransfer, ['otp'])
    });
};

async function createPayDebtTransfer(req, res) {
    const { userId: customerId } = req.auth;
    const { debtId } = req.body;

    const debt = await debtModel.getDebtById(debtId);
    if (customerId !== debt.fromCustomerId) throw new HttpErrors.Forbidden();
    const fromCustomer = await customerModel.getById(debt.fromCustomerId);
    const fromCustomerCurrentAccount = await accountModel.getCurrentAccountByCustomerId(debt.fromCustomerId);
    const toCustomerCurrentAccount = await accountModel.getCurrentAccountByCustomerId(debt.toCustomerId);

    const otp = generateTOTP(customer.otpSecret);
    const createdTransfer = await transferModel.createPayDebtTransfer({
        customerId: debt.fromCustomerId,
        fromAccountNumber: fromCustomerCurrentAccount.accountNumber,
        toAccountNumber: toCustomerCurrentAccount.accountNumber,
        amount: debt.amount,
        message: debt.message,
        otp: otp
    });

    await sendOtpMail({ customerName: fromCustomer.fullName, toEmail: fromCustomer.email, otp: otp });

    return res.status(201).json({
        transfer: _.omit(createdTransfer, ['otp'])
    });
};

async function confirmIntrabankTransfer(req, res) {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;
    const { otp } = req.body;

    const transfer = await transferModel.getTransferById(transferId);
    if (!transfer) throw new HttpErrors.NotFound();
    if (transfer.customerId !== customerId) throw new HttpErrors.Forbidden();
    const customer = await customerModel.getById(customerId);
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);
    if (transfer.otp !== otp) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);

    await transferModel.confirmIntraBankTransfer(transferId);

    res.status(200).json({
        message: 'Transfer confirmed.'
    });
};

async function confirmInterbankTransfer(req, res) {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;
    const { otp } = req.body;

    const transfer = await transferModel.getTransferById(transferId);
    if (!transfer) throw new HttpErrors.NotFound();
    if (transfer.customerId !== customerId) throw new HttpErrors.Forbidden();
    if (!transfer.toBankId) throw new HttpErrors.BadRequest();
    const customer = await customerModel.getById(customerId);
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrors.Forbidden();

    const targetBankingApi = linkedBankBankingApiModules[transfer.toBankId];
    if (!targetBankingApi) throw new HttpErrors.InternalServerError();
    const transferCurrency = await currencyModel.getById(transfer.currencyId);
    if (!transferCurrency) throw new HttpErrors.InternalServerError();
    const apiCallResult = await targetBankingApi.transfer({
        accountNumber: transfer.toAccountNumber,
        amount: transfer.amount,
        currency: transferCurrency.code,
        reason: transfer.message
    });
    if (!apiCallResult) {
        await transferModel.makeTransferRejected(transferId);
        throw new HttpErrors.InternalServerError();
    }

    await transferModel.confirmInterBankTransfer(transferId);

    return res.status(200).json({
        message: 'Transfer confirmed.'
    });
};

async function confirmPayDebtTransfer(req, res) {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;
    const { otp } = req.body;

    const transfer = await transferModel.getTransferById(transferId);
    if (!transfer) throw new HttpErrors.NotFound();
    if (transfer.typeId !== TRANSFER_TYPES.PAY_DEBT_TRANSFER) throw new HttpErrors.BadRequest();
    if (transfer.customerId !== customerId) throw new HttpErrors.Forbidden();
    
    const customer = await customerModel.getById(customerId);
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);
    if (transfer.otp !== otp) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);

    await transferModel.confirmPayDebtTransfer(transferId);

    const debt = await debtModel.getDebtByTransferId(transfer.id);
    notifyDebtPaid(debt.fromCustomerId, customer.fullName, transfer.message);
    
    res.status(200).json({
        message: 'Transfer confirmed.'
    });
};
