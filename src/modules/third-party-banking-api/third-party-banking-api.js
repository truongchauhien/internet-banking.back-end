import { readdirSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as thirdPartyBankingAPIModel from '../../models/third-party-banking-api-model.js';
import logger from '../logger/logger.js';

export const thirdPartyBankingApiModules = {};
export default thirdPartyBankingApiModules;
export const thirdPartyBanks = [];

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;

    // Import banking api modules.
    const banks = await thirdPartyBankingAPIModel.getAllBanks();
    const apiModules = await importThirdPartyBankingApiModules();

    for (const bank of banks) {
        const respectiveBankingApiModule = apiModules.find(
            apiModule => bank.id === apiModule.meta.bankId
        );

        respectiveBankingApiModule.meta.name = bank.name;
        thirdPartyBankingApiModules[bank.id] = respectiveBankingApiModule;
    }

    // List of banks have banking api.
    for (const [bankId, apiModule] of Object.entries(thirdPartyBankingApiModules)) {
        thirdPartyBanks.push({
            id: bankId,
            name: apiModule.meta.name
        });
    }

    thirdPartyBanks.sort((bank1, bank2) => {
        if (bank1.name > bank2.name) {
            return 1
        } else if (bank1.name < bank2.name) {
            return -1;
        } else {
            return 0
        };
    });

    isSetup = true;

    logger.info('Third-party banking APIs have been loaded.');
};

async function importThirdPartyBankingApiModules() {
    const modules = [];

    const pathToApiDirectory = path.join(dirname(fileURLToPath(import.meta.url)), './api-modules/');
    const dirNames = readdirSync(pathToApiDirectory, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

    for (const dirName of dirNames) {
        const bankingApiModule = await import(`./api-modules/${dirName}/index.js`);
        modules.push(bankingApiModule);
    }

    return modules;
}
