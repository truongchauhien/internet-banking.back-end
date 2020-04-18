import _ from 'lodash';
import { HttpErrorClasses } from '../extensions/http-error.js';
import { getByAccountNumber as getCustomerByAccountNumber } from '../../models/customer-model.js';
import thirdPartyBankingApiModules, { thirdPartyBanks } from '../../modules/third-party-banking-api/third-party-banking-api.js'

export const queryAccountInformation = async (req, res, next) => {
    const { accountNumber, bankId } = req.body;

    if (!bankId) {
        const customer = await getCustomerByAccountNumber(accountNumber);
        if (!customer) throw new HttpErrorClasses.NotFound();
        return res.status(200).json({
            accountNumber: accountNumber,
            holderName: customer.fullName
        });
    } else {
        const bankingApiModule = thirdPartyBankingApiModules[bankId];
        if (!bankingApiModule) throw new HttpErrorClasses.BadRequest();
        const foundAccount = await bankingApiModule.getAccount({ accountNumber: accountNumber });
        if (!foundAccount) throw new HttpErrorClasses.NotFound();

        return res.status(200).json(foundAccount);
    }
};

export const queryTransferableBankList = async (req, res, next) => {
    return res.status(200).json({
        banks: thirdPartyBanks
    });
};
