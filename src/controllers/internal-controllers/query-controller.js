import _ from 'lodash';
import HttpErrors from '../extensions/http-errors.js';
import { getByAccountNumber as getCustomerByAccountNumber } from '../../models/customer-model.js';
import linkedBankBankingApiModules, { linkedBanks } from '../../modules/linked-banks/banking-api-modules.js'

export const getAccountInformation = async (req, res, next) => {
    const { accountNumber, bankId } = req.body;

    if (!bankId) {
        const customer = await getCustomerByAccountNumber(accountNumber);
        if (!customer) throw new HttpErrors.NotFound();
        return res.status(200).json({
            accountNumber: accountNumber,
            holderName: customer.fullName
        });
    } else {
        const bankingApiModule = linkedBankBankingApiModules[bankId];
        if (!bankingApiModule) throw new HttpErrors.BadRequest();
        const foundAccount = await bankingApiModule.getAccount({ accountNumber: accountNumber });
        if (!foundAccount) throw new HttpErrors.NotFound();

        return res.status(200).json(foundAccount);
    }
};

export const getLinkedBanks = async (req, res, next) => {
    return res.status(200).json({
        banks: linkedBanks
    });
};
