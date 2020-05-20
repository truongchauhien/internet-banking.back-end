import * as bankModel from "../../../models/bank-model.js";

export const getBanks = async (req, res) => {
    const banks = await bankModel.getAll(['id', 'name', 'hasApi']);
    return res.status(200).json({
        banks
    });
};
