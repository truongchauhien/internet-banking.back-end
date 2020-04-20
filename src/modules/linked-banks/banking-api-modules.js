import { readdirSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as linkedBankModel from '../../models/linked-banks-models.js';
import logger from '../logger/logger.js';

export const bankingApiModules = {};
export default bankingApiModules;
/**
 * The list of linked banks that have a existed (or enabled) banking api module.
 * The length of the list maybe less than the length of the list in database, because a banking api module may be disabled.
 */
export const linkedBanks = [];

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;

    // Import banking api modules.
    const linkedBankListInDatabase = await linkedBankModel.getAll();
    const importedBankingApiModules = await importBankingApiModules();

    for (const bank of linkedBankListInDatabase) {
        const respectiveBankingApiModule = importedBankingApiModules.find(
            apiModule => bank.id === apiModule.meta.bankId
        );

        respectiveBankingApiModule.meta.name = bank.name;
        bankingApiModules[bank.id] = respectiveBankingApiModule;
    }

    // List of banks have banking api.
    for (const [bankId, apiModule] of Object.entries(bankingApiModules)) {
        linkedBanks.push({
            id: bankId,
            name: apiModule.meta.name
        });
    }

    linkedBanks.sort((bank1, bank2) => {
        if (bank1.name > bank2.name) {
            return 1
        } else if (bank1.name < bank2.name) {
            return -1;
        } else {
            return 0
        };
    });

    isSetup = true;

    logger.info('Linked banking APIs have been loaded.');
};

async function importBankingApiModules() {
    const modules = [];

    const pathToApiDirectory = path.join(dirname(fileURLToPath(import.meta.url)), './banking-api-modules/');
    const dirNames = readdirSync(pathToApiDirectory, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

    for (const dirName of dirNames) {
        const bankingApiModule = await import(`./banking-api-modules/${dirName}/index.js`);
        modules.push(bankingApiModule);
    }

    return modules;
}
