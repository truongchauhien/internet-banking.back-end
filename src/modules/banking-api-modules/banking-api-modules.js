import { readdirSync } from 'fs';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import * as bankModel from '../../models/bank-model.js';
import logger from '../logger/logger.js';

export const bankingApiModules = {};
export default bankingApiModules;

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;

    // Import banking api modules.
    const banksHasApi = (await bankModel.getAllBanks()).filter(bank => bank.hasApi);
    const importedBankingApiModules = await importBankingApiModules();

    for (const bank of banksHasApi) {
        const respectiveBankingApiModule = importedBankingApiModules.find(
            apiModule => bank.id === apiModule.meta.bankId
        );

        respectiveBankingApiModule.meta.name = bank.name;
        bankingApiModules[bank.id] = respectiveBankingApiModule;
    }

    isSetup = true;
    logger.info('Banking API modules have been loaded.');
};

async function importBankingApiModules() {
    const modules = [];

    const pathToApiDirectory = path.resolve(dirname(fileURLToPath(import.meta.url)), '../../../banking-api-modules');
    const dirNames = readdirSync(pathToApiDirectory, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

    for (const dirName of dirNames) {
        const bankingApiModule = await import(`../../../banking-api-modules/${dirName}/index.js`);
        modules.push(bankingApiModule);
    }

    return modules;
}
