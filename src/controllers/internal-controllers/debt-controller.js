import _ from 'lodash';
import HttpErrors from '../extensions/http-errors.js';
import * as debtModel from '../../models/debt-model.js';
import * as customerModel from '../../models/customer-model.js';
import {
    notifyDebtCreated,
    notifyDebtCanceledBySender,
    notifyDebtCanceledByReceiver
} from '../../modules/realtime-notifications/customer-notifications.js';

export const createDebt = async (req, res) => {
    const { userId: customerId } = req.auth;
    let { toCustomerId, amount, message } = req.body;

    if (customerId === toCustomerId) throw new HttpErrors.BadRequest();

    const customer = customerModel.getById(customerId);
    const toCustomer = customerModel.getById(toCustomerId);
    if (!toCustomer) throw new HttpErrors.BadRequest();

    const createdDebt = await debtModel.createDebt({
        fromCustomerId: customerId,
        toCustomerId,
        amount,
        message
    });

    notifyDebtCreated(toCustomerId, customer.fullName);
    return res.status(201).json({
        debt: createdDebt
    });
};

export const getDebts = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { type, fromTime, toTime, newOnly: rawNewOnly, pageNumber: rawPageNumber } = req.query;

    let newOnly = rawNewOnly === 'true';
    let pageNumber = Number.parseInt(rawPageNumber) || 1;
    if (pageNumber <= 0) throw new HttpErrors.BadRequest();

    const pageSize = 10;

    let debts, totalPages;
    switch (type) {
        case 'sent':
            [totalPages, debts] = await debtModel.findBySender(customerId, new Date(fromTime), new Date(toTime), newOnly, pageSize, pageNumber);
            break;
        case 'received':
            [totalPages, debts] = await debtModel.findByReceiver(customerId, new Date(fromTime), new Date(toTime), newOnly, pageSize, pageNumber);
            break;
        case 'both':
            [totalPages, debts] = await debtModel.findByBothSenderAndReceiver(customerId, new Date(fromTime), new Date(toTime), newOnly, pageSize, pageNumber);
            break;
        default:
            throw new HttpErrors.BadRequest();
    }

    return res.status(200).json({
        debts: debts,
        pageNumber: pageNumber,
        totalPages: totalPages
    });
};

export const cancelDebt = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { debtId } = req.params;
    const { canceledReason } = req.body;

    const debt = await debtModel.getDebtById(debtId);
    if (!debt) throw new HttpErrors.NotFound();

    await debtModel.cancelDebt({
        debtId,
        changerId: customerId,
        canceledReason
    });

    if (customerId === debt.fromCustomerId) {
        const receiver = await customerModel.getById(debt.toCustomerId);
        notifyDebtCanceledBySender(receiver.id, receiver.fullName, canceledReason);
    } else {
        const sender = await customerModel.getById(debt.fromCustomerId);
        notifyDebtCanceledByReceiver(sender.id, sender.fullName, canceledReason);
    }

    return res.status(200);
};
