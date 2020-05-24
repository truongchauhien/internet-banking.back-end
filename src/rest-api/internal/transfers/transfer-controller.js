import _ from 'lodash';
import HttpErrors from '../../commons/errors/http-errors.js';
import ERRORS from '../../commons/errors/error-meta.js';
import * as customerModel from '../../../models/customer-model.js';
import * as accountModel from '../../../models/account-model.js';
import * as transferModel from '../../../models/transfer-model.js';
import * as debtModel from '../../../models/debt-model.js';
import * as currencyModel from '../../../models/currency-model.js';
import TRANSFER_TYPES from '../../../models/constants/transfer-types.js';
import generateTOTP from '../../../modules/otp/generate-totp.js';
import verifyTOTP from '../../../modules/otp/verify-totp.js';
import { sendOtpMailForTransferCofirmation } from '../../../modules/mail/send-otp-mail.js';
import { notifyDebtPaid } from '../../../modules/push-service/customer-pusher.js';
import BANKS from '../../../models/constants/banks.js';
import bankingApiModules from '../../../modules/banking-api-modules/banking-api-modules.js';

export const createTransfer = async (req, res) => {
    const { type: transferType } = req.body;

    switch (transferType) {
        case 'intrabank':
            await createIntrabankTransfer(req, res);
            break;
        case 'interbank':
            await createInterbankTransfer(req, res);
            break;
        case 'paydebt':
            await createPayDebtTransfer(req, res);
            break;
        default:
            throw new HttpErrors.BadRequest();
    }
};

export const confirmTransfer = async (req, res) => {
    const { type: transferType } = req.body;

    switch (transferType) {
        case 'intrabank':
            await confirmIntrabankTransfer(req, res);
            break;
        case 'interbank':
            await confirmInterbankTransfer(req, res);
            break;
        case 'paydebt':
            await confirmPayDebtTransfer(req, res);
            break;
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
        fromAccountNumber,
        toAccountNumber,
        amount,
        message,
        otp,
        whoPayFee
    });

    sendOtpMailForTransferCofirmation({ customerName: customer.fullName, toEmail: customer.email, otp: otp });

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

    if (toBankId == BANKS.INTERNAL) throw new HttpErrors.BadRequest();    
    const bankingApiModule = bankingApiModules[toBankId];
    if (!bankingApiModule) throw new HttpErrors.BadRequest();
    const toAccount = await bankingApiModule.getAccount({ accountNumber: toAccountNumber });
    if (!toAccount) throw new HttpErrors.BadRequest();

    const otp = generateTOTP(customer.otpSecret);
    const createdTransfer = await transferModel.createInterbankTransfer({
        fromAccountNumber,
        toAccountNumber,
        toBankId,
        amount,
        message,
        otp,
        whoPayFee
    });

    sendOtpMailForTransferCofirmation({ customerName: customer.fullName, toEmail: customer.email, otp: otp });

    return res.status(201).json({
        transfer: _.omit(createdTransfer, ['otp'])
    });
};

async function createPayDebtTransfer(req, res) {
    const { userId: customerId } = req.auth;
    const { debtId } = req.body;

    const debt = await debtModel.getDebtById(debtId);
    if (!debt) throw new HttpErrors.BadRequest();
    // Who is paying for the debt is who received the debt.
    if (customerId !== debt.toCustomerId) throw new HttpErrors.Forbidden();
    const whoPaysDebt = await customerModel.getById(debt.toCustomerId);
    const whoCreatedDebtCurrentAccount = await accountModel.getDefaultCurrentAccountByCustomerId(debt.fromCustomerId);
    const whoPaysDebtCurrentAccount = await accountModel.getDefaultCurrentAccountByCustomerId(debt.toCustomerId);

    const otp = generateTOTP(whoPaysDebt.otpSecret);
    const createdTransfer = await transferModel.createPayDebtTransfer({
        debtId: debt.id,
        fromAccountNumber: whoPaysDebtCurrentAccount.accountNumber,
        toAccountNumber: whoCreatedDebtCurrentAccount.accountNumber,
        amount: debt.amount,
        message: debt.message,
        otp: otp
    });

    sendOtpMailForTransferCofirmation({ customerName: whoPaysDebt.fullName, toEmail: whoPaysDebt.email, otp: otp });

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
    if (transfer.typeId !== TRANSFER_TYPES.INTRABANK_TRANSFER) throw new HttpErrors.BadRequest();
    if (transfer.fromCustomerId !== customerId) throw new HttpErrors.Forbidden();

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
    if (transfer.typeId !== TRANSFER_TYPES.INTERBANK_TRANSFER) throw new HttpErrors.BadRequest();
    if (transfer.fromCustomerId !== customerId) throw new HttpErrors.Forbidden();

    // Verify OTP.
    const customer = await customerModel.getById(customerId);
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);
    if (transfer.otp !== otp) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);

    // Calling banking api of the target bank.
    const bankingApiModule = bankingApiModules[transfer.toBankId];
    if (!bankingApiModule) throw new HttpErrors.InternalServerError();
    const currency = await currencyModel.getById(transfer.toCurrencyId);
    if (!currency) throw new HttpErrors.InternalServerError();
    if (!await bankingApiModule.transfer({
        accountNumber: transfer.toAccountNumber,
        amount: transfer.toAmount,
        currency: currency.code,
        message: transfer.message
    })) {
        await transferModel.makeTransferRejectedByTargetBank(transferId);
        throw new HttpErrors.InternalServerError();
    };

    // All things are OK.
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
    if (transfer.fromCustomerId !== customerId) throw new HttpErrors.Forbidden();

    const customer = await customerModel.getById(customerId);
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);
    if (transfer.otp !== otp) throw new HttpErrors.Forbidden(ERRORS.INCORRECT_OTP);

    await transferModel.confirmPayDebtTransfer(transferId);

    const debt = await debtModel.getDebtByTransferId(transfer.id);
    // Send notification to debt sender.
    notifyDebtPaid(debt.fromCustomerId, customer.fullName);

    res.status(200).json({
        message: 'Transfer confirmed.'
    });
};
