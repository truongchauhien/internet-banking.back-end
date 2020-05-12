import { getAllBanks } from "../../../models/bank-model.js";

export const getBanks = async (req, res) => {
    const banks = await getAllBanks(['id', 'name', 'hasApi']);
    return res.status(200).json({
        banks
    });
};
