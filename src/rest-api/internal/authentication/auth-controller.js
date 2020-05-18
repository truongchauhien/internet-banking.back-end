import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import FormData from 'form-data';
import jwt from 'jsonwebtoken';
import _ from 'lodash';
import HttpErrors from '../../commons/errors/http-errors.js';
import * as customerModel from '../../../models/customer-model.js';
import * as employeeModel from '../../../models/employee-model.js';
import * as administratorModel from '../../../models/administrator-model.js';
import { sendOtpMailForPasswordResetConfirmationMail } from '../../../modules/mail/send-otp-mail.js';
import generateTOTP from '../../../modules/otp/generate-totp.js';
import verifyTOTP from '../../../modules/otp/verify-totp.js';
import config from '../../../modules/configs/configs.js';

const TOKEN_SECRET_KEY = config.get('tokenSecretKey');
const RECAPTCHA_SECRET_KEY = config.get('recaptchaSecretKey');

/**
 * 
 * @param {Object} payload
 * @param {String} payload.userId
 * @param {String} payload.userType
 */
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

const verifyRecaptcha = async (captchaToken) => {
    const recaptchaData = new FormData();
    recaptchaData.append('secret', RECAPTCHA_SECRET_KEY);
    recaptchaData.append('response', captchaToken);
    const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        body: recaptchaData
    });

    if (!recaptchaResponse.ok) {
        throw new HttpErrors.InternalServerError({
            message: 'Can not verify Google reCAPTCHA token.'
        });
    }

    const recaptchaResponseJsonObject = await recaptchaResponse.json();
    return recaptchaResponseJsonObject.success;
};

/**
 * 
 * @param {Request} req
 * @param {Response} res
 */
export const userLogin = async (req, res, next) => {
    const { userName, password, userType = 'customer', captchaToken } = req.body;

    if (!await verifyRecaptcha(captchaToken)) throw new HttpErrors.BadRequest();

    let user = null;
    switch (userType) {
        case 'customer':
            user = await customerModel.getByUserName(userName);
            break;
        case 'employee':
            user = await employeeModel.getByUserName(userName);
            break;
        case 'administrator':
            user = await administratorModel.getByUserName(userName);
            break;
        default:
            // User type is not provided.
            throw new HttpErrors.BadRequest();
    }

    if (!user) {
        throw new HttpErrors.Forbidden();
    }

    if (!await bcrypt.compare(password, user.password)) {
        throw new HttpErrors.Forbidden();
    }

    const refreshToken = await generateRefreshToken();

    if (userType === 'customer') {
        await customerModel.update(user.id, {
            refreshToken
        });
    } else if (userType === 'employee') {
        await employeeModel.update(user.id, {
            refreshToken
        });
    } else if (userType === 'administrator') {
        await administratorModel.update(user.id, {
            refreshToken
        });
    }

    const accessToken = await generateAccessToken({
        userId: user.id,
        userType: userType
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
    const { userId, userType = 'customer', refreshToken } = req.body;

    let user = null;
    switch (userType) {
        case 'customer':
            user = await customerModel.getById(userId);
            break;
        case 'employee':
            user = await employeeModel.getById(userId);
            break;
        case 'administrator':
            user = await administratorModel.getById(userId);
            break;
        default:
            throw new HttpErrors.BadRequest();
    }

    if (!user) {
        throw new HttpErrors.Forbidden();
    }

    if (user.refreshToken !== refreshToken) {
        throw new HttpErrors.Forbidden();
    }

    const newRefreshToken = await generateRefreshToken();
    const newAccessToken = await generateAccessToken({
        userId: user.id,
        userType: userType
    });

    switch (userType) {
        case 'customer':
            await customerModel.update(userId, {
                refreshToken: newRefreshToken
            });
            break;
        case 'employee':
            await employeeModel.update(userId, {
                refreshToken: newRefreshToken
            });
            break;
        case 'administrator':
            await administratorModel.update(userId, {
                refreshToken: newRefreshToken
            });
            break;
    }

    res.status(200).json({
        userId,
        userType,
        refreshToken: newRefreshToken,
        accessToken: newAccessToken
    });
};

export const createResetPasswordRequest = async (req, res) => {
    const { userType = 'customer' } = req.body;

    switch (userType) {
        case 'customer':
            return createPasswordResetForCustomer(req, res);
        case 'employee':
            throw new HttpErrors.BadRequest();
        case 'administrator':
            throw new HttpErrors.BadRequest();
        default:
            throw new HttpErrors.BadRequest();
    }
};

async function createPasswordResetForCustomer(req, res) {
    const { email } = req.body;

    const customer = await customerModel.getByEmail(email);
    if (!customer) throw new HttpErrors.NotFound();

    const otp = generateTOTP(customer.otpSecret);
    sendOtpMailForPasswordResetConfirmationMail({
        customerName: customer.fullName,
        toEmail: customer.email,
        otp
    });

    return res.status(200).end();
};

export const confirmPasswordReset = async (req, res) => {
    const { userType = 'customer' } = req.body;

    switch (userType) {
        case 'customer':
            return confirmPasswordResetForCustomer(req, res);
        case 'employee':
            throw new HttpErrors.BadRequest();
        case 'administrator':
            throw new HttpErrors.BadRequest();
        default:
            throw new HttpErrors.BadRequest();
    }
};

async function confirmPasswordResetForCustomer(req, res) {
    const { email, otp, newPassword } = req.body;

    const customer = await customerModel.getByEmail(email);
    if (!customer) throw new HttpErrors.NotFound();
    if (!verifyTOTP(otp, customer.otpSecret, 10)) throw new HttpErrors.Forbidden();

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await customerModel.update(customer.id, {
        password: hashedPassword
    });

    return res.status(200).end();
};
