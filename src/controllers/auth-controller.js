import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import FormData from 'form-data';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import _ from 'lodash';
import {
    getByUserName as getCustomerByUserName,
    updateRefreshToken as updateCustomerRefreshToken,
    getById as getCustomerById
} from '../models/customer-model.js';
import {
    getByUserName as getEmployeeByUserName,
    updateRefreshToken as updateEmployeeRefreshToken,
    getById as getEmployeeById
} from '../models/employee-model.js';
import {
    getByUserName as getAdministratorByUserName,
    updateRefreshToken as updateAdministratorRefreshToken,
    getById as getAdministratorById
} from '../models/administrator-model.js';

import config from '../configs/config-schema.js';

const TOKEN_SECRET_KEY = config.get('tokenSecretKey');
const RECAPTCHA_SECRET_KEY = config.get('recaptchaSecretKey');

const generateAccessToken = (payload) => {
    return new Promise((resolve, reject) => {
        jwt.sign(payload, TOKEN_SECRET_KEY, { expiresIn: '5m' }, (err, encoded) => {
            if (err) {
                reject(err);
            } else {
                resolve(encoded);
            }
        })
    });
};

const generateRefreshToken = () => {
    return new Promise((resolve, reject) => {
        randomBytes(64, (err, buffer) => {
            if (err) {
                reject(err);
            } else {
                resolve(buffer.toString('hex'));
            }
        });
    });
};

/**
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const userLogin = async (req, res, next) => {
    const { userType, userName, password, captchaToken } = req.body;

    const recaptchaData = new FormData();
    recaptchaData.append('secret', RECAPTCHA_SECRET_KEY);
    recaptchaData.append('response', captchaToken);
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: recaptchaData
    });

    if (!recaptchaResponse.ok) {
        return next(new createError.InternalServerError('Can not verify Google reCAPTCHA token.'));
    }

    const recaptchaResponseJsonObject = await recaptchaResponse.json();
    if (!recaptchaResponseJsonObject.success) {
        return res.status(400).json({
            message: 'Google reCAPTCHA challenge was not complete.'
        });
    }

    let user = null;
    switch (userType) {
        case 'customer':
            user = await getCustomerByUserName(userName);
            break;
        case 'employee':
            user = await getEmployeeByUserName(userName);
            break;
        case 'administrator':
            user = await getAdministratorByUserName(userName);
            break;
        default:
            return res.status(400).json({
                message: 'User type is not provided.'
            });
    }

    if (!user) {
        return res.status(403).json({
            message: `The ${userType} does not exist.`
        });
    }

    if (!await bcrypt.compare(password, user.password)) {
        return res.status(403).json({
            message: 'Password is wrong.'
        });
    }

    const refreshToken = await generateRefreshToken();

    if (userType === 'customer') {
        await updateCustomerRefreshToken(user.id, refreshToken);
    } else if (userType === 'employee') {
        await updateEmployeeRefreshToken(user.id)
    } else if (userType === 'administrator') {
        await updateAdministratorRefreshToken(user.id, refreshToken);
    }

    const accessToken = await generateAccessToken({
        userId: user.id
    });
    
    res.status(200).json({
        accessToken,
        refreshToken,
        userType,
        userId: user.id,
        ...(_.pick(user, ['userName', 'fullName', 'email']))
    });
};

/**
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const userRenewToken = async (req, res) => {
    const { userType, userId, refreshToken } = req.body;

    let user = null;
    switch (userType) {
        case 'customer':
            user = getCustomerById(userId);
            break;
        case 'employee':
            user = getEmployeeById(userId);
            break;
        case 'administrator':
            user = getAdministratorById(userId);
            break;
        default:
            return res.status(400).json({ message: '' });
    }

    if (!user) {
        return res.status(403).json({
            message: ''
        });
    }

    if (user.refreshToken !== refreshToken) {
        return res.status(403).json({
            message: ''
        });
    }

    const newRefreshToken = await generateRefreshToken();
    const newAccessToken = await generateAccessToken({
        userId: user.id
    });

    switch (userType) {
        case 'customer':
            await updateCustomerRefreshToken(userId, newRefreshToken);
            break;
        case 'employee':
            await updateEmployeeRefreshToken(userId, refreshToken);
            break;
        case 'administrator':
            await updateAdministratorRefreshToken(userId, refreshToken);
            break;
    }

    res.status(200).json({
        userId,
        refreshToken: newRefreshToken,
        accessToken: newAccessToken
    });
};
