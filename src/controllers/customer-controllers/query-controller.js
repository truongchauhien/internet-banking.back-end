import _ from 'lodash';
import HttpErrors from '../extensions/http-errors.js';
import { getByAccountNumber as getCustomerByAccountNumber } from '../../models/customer-model.js';
import thirdPartyBankingApiModules, { thirdPartyBanks } from '../../modules/third-party-banking-api/third-party-banking-api.js'

export const queryAccountInformation = async (req, res, next) => {
    const { accountNumber, bankId } = req.body;

    if (!bankId) {
        const customer = await getCustomerByAccountNumber(accountNumber);
        if (!customer) throw new HttpErrors.NotFound();
        return res.status(200).json({
            accountNumber: accountNumber,
            holderName: customer.fullName
        });
    } else {
        if (!bankingApiModule) throw new HttpErrors.BadRequest();
        const foundAccount = await bankingApiModule.getAccount({ accountNumber: accountNumber });
        if (!foundAccount) throw new HttpErrors.NotFound();

        return res.status(200).json(foundAccount);
    }
};

export const queryTransferableBankList = async (req, res, next) => {
    return res.status(200).json({
        banks: thirdPartyBanks
    });
};
