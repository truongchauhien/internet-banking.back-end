import { readdirSync } from 'fs';
import path, { dirname } from 'path';
import url from 'url';
import configs from '../configs/configs.js';
import * as bankModel from '../../models/bank-model.js';
import logger from '../logger/logger.js';

export const bankingApiModules = {};
export default bankingApiModules;

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;

    // Import banking api modules.
    const banksHasApi = (await bankModel.getAll()).filter(bank => bank.hasApi);
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

    const pathToBankingApiModules = path.resolve(configs.get('bankingApiModules.path'));
    const dirNames = readdirSync(pathToBankingApiModules, { withFileTypes: true })
        .filter(dir => dir.isDirectory())
        .map(dir => dir.name);

    for (const dirName of dirNames) {
        const pathToModuleFile = path.resolve(pathToBankingApiModules, `${dirName}/index.js`);
        const urlToModule = url.pathToFileURL(pathToModuleFile);
        const bankingApiModule = await import(urlToModule);
        bankingApiModule.setup && await bankingApiModule.setup();
        modules.push(bankingApiModule);
    }

    return modules;
}
