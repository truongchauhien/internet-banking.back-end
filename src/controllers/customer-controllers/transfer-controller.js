import _ from 'lodash';
import { HttpErrorClasses } from '../extensions/http-error.js';
import ERRORS from '../extensions/errors.js';
import generateTOTP from '../../modules/otp/generate-totp.js';
import verifyTOTP from '../../modules/otp/verify-totp.js';
import { sendOtpMail } from '../../modules/mail/send-otp-mail.js';
import * as customerModel from '../../models/customer-model.js';
import * as transferModel from '../../models/transfer-model.js';
import * as currencyModel from '../../models/currency-model.js';
import { banks as interBankingApis } from '../../modules/transferable-banks/transferable-banks.js';
import logger from '../../modules/logger/logger.js';

export const createIntrabankTransfer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { fromAccountNumber, toAccountNumber, amount, message, whoPayFee } = req.body;

    const customer = await customerModel.getByAccountNumber(fromAccountNumber);
    if (!customer) throw new HttpErrorClasses.BadRequest();
    if (customer.id !== customerId) throw new HttpErrorClasses.Forbidden();

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

export const createInterbankTransfer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { fromAccountNumber, toAccountNumber, toBankId, amount, message, whoPayFee } = req.body;

    const customer = await customerModel.getByAccountNumber(fromAccountNumber);
    if (!customer) throw new HttpErrorClasses.BadRequest();
    if (customer.id !== customerId) throw new HttpErrorClasses.Forbidden();

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

export const confirmIntrabankTransfer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;
    const { otp } = req.body;

    const transfer = await transferModel.getTransferById(transferId);
    if (!transfer) throw new HttpErrorClasses.NotFound();
    if (transfer.customerId !== customerId) throw new HttpErrorClasses.Forbidden();
    const customer = await customerModel.getById(customerId);
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrorClasses.Forbidden(ERRORS.INCORRECT_OTP);
    if (transfer.otp !== otp) throw new HttpErrorClasses.Forbidden(ERRORS.INCORRECT_OTP);

    await transferModel.confirmIntraBankTransfer(transferId);

    res.status(200).json({
        message: 'Transfer confirmed.'
    });
};

export const confirmInterbankTransfer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;
    const { otp } = req.body;

    const transfer = await transferModel.getTransferById(transferId);
    if (!transfer) throw new HttpErrorClasses.NotFound();
    if (transfer.customerId !== customerId) throw new HttpErrorClasses.Forbidden();
    if (!transfer.toBankId) throw new HttpErrorClasses.BadRequest();
    const customer = await customerModel.getById(customerId);
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrorClasses.Forbidden();

    const targetBankingApi = interBankingApis[transfer.toBankId];
    if (!targetBankingApi) throw new HttpErrorClasses.InternalServerError();
    const transferCurrency = await currencyModel.getById(transfer.currencyId);
    if (!transferCurrency) throw new HttpErrorClasses.InternalServerError();
    const apiCallResult = await targetBankingApi.transfer({
        accountNumber: transfer.toAccountNumber,
        amount: transfer.amount,
        currency: transferCurrency.code,
        reason: transfer.message
    });
    if (!apiCallResult) {
        await transferModel.makeTransferRejected(transferId);
        throw new HttpErrorClasses.InternalServerError();
    }

    await transferModel.confirmInterBankTransfer(transferId);

    return res.status(200).json({
        message: 'Transfer confirmed.'
    });
};

export const getIntrabankTransfer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;

    const transfer = await transferModel.getTransferById(transferId);
    if (customerId !== transfer.customerId) throw new HttpErrorClasses.Forbidden();
    if (transfer.toBankId) throw new HttpErrorClasses.BadRequest();

    const compactTransfer = _.omit(transfer, ['otp']);
    return res.status(200).json({
        transfer: compactTransfer
    });
};

export const getInterbankTransfer = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { transferId } = req.params;

    const transfer = transferModel.getTransferById(transferId);
    if (customerId !== transfer.customerId) throw new HttpErrorClasses.Forbidden();
    if (!transfer.toBankId) throw new HttpErrorClasses.BadRequest();

    const compactTransfer = _.omit(transfer, ['otp']);
    return res.status(200).json({
        transfer: compactTransfer
    });
};
