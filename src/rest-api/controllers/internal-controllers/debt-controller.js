import _ from 'lodash';
import HttpErrors from '../extensions/http-errors.js';
import * as debtModel from '../../../models/debt-model.js';
import * as customerModel from '../../../models/customer-model.js';
import {
    notifyDebtCreated,
    notifyDebtCanceledBySender,
    notifyDebtCanceledByReceiver
} from '../../../modules/realtime-notifications/customer-notifications.js';

export const createDebt = async (req, res) => {
    const { userId: customerId } = req.auth;
    let { toCustomerHasAccountNumber, amount: rawAmount, message: rawMessage } = req.body;

    const amount = Number.parseInt(rawAmount) || 0;
    if (amount <= 0) throw new HttpErrors.BadRequest();
    const message = rawMessage || '';

    const toCustomer = await customerModel.getByAccountNumber(toCustomerHasAccountNumber);
    if (!toCustomer) throw new HttpErrors.BadRequest();
    if (customerId === toCustomer.id) throw new HttpErrors.BadRequest(); // A customer sends debt to himself/herself.
    const fromCustomer = await customerModel.getById(customerId);

    const createdDebt = await debtModel.createDebt({
        fromCustomerId: fromCustomer.id,
        toCustomerId: toCustomer.id,
        amount,
        message
    });

    notifyDebtCreated(toCustomer.id, fromCustomer.fullName, message);
    return res.status(201).json({
        debt: createdDebt
    });
};

export const getDebts = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { type, newOnly: rawNewOnly, startingAfter: rawStartingAfter } = req.query;

    let newOnly = rawNewOnly === 'true';
    let startingAfter = Number.parseInt(rawStartingAfter) || null;

    const limit = 1;

    let debts;
    switch (type) {
        case 'sent':
            debts = await debtModel.findBySender(customerId, newOnly, limit + 1, startingAfter);
            break;
        case 'received':
            debts = await debtModel.findByReceiver(customerId, newOnly, limit + 1, startingAfter);
            break;
        case 'both':
            debts = await debtModel.findByBothSenderAndReceiver(customerId, newOnly, limit + 1, startingAfter);
            break;
        default:
            throw new HttpErrors.BadRequest();
    }

    let hasMore = false;
    if (Array.isArray(debts) && debts.length > limit) {
        debts.pop();
        hasMore = true;
    }

    return res.status(200).json({
        debts: debts,
        hasMore: hasMore
    });
};

export const cancelDebt = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { debtId } = req.params;
    const { canceledReason: rawCanceledReason } = req.body;

    const debt = await debtModel.getDebtById(debtId);
    if (!debt) throw new HttpErrors.NotFound();
    let canceledReason = rawCanceledReason || '';

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

    return res.status(200).end();
};

export const getDebt = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { identityValue } = req.params;
    const { identityType: rawIdentityType } = req.query;

    let identityType = rawIdentityType || 'id';

    let debt;
    switch (identityType) {
        case 'id':
            debt = await debtModel.getDebtById(identityValue);
            break;
        case 'transferId':
            debt = await debtModel.getDebtByTransferId(identityValue);
            break;
        default:
            throw new HttpErrors.BadRequest();
    }

    if (!debt) throw new HttpErrors.NotFound();
    if (![debt.fromCustomerId, debt.toCustomerId].includes(customerId)) throw new HttpErrors.Forbidden();

    return res.status(200).json({
        debt: debt
    });
};
