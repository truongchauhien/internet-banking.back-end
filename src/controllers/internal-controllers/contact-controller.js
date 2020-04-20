import _ from 'lodash';
import * as contactModel from '../../models/contact-model.js';
import HttpErrors from '../extensions/http-errors.js';

export const getContacts = async (req, res) => {
    const { userId: customerId } = req.auth;
    const contacts = await contactModel.findAllContacts(customerId);

    return res.status(200).json({
        contacts: contacts
    });
};

export const createContact = async (req, res) => {
    const { userId: customerId } = req.auth;
    const contact = {
        ...(_.pick(req.body, ['accountNumber', 'name'])),
        customerId: customerId
    };
    const contactId = await contactModel.createContact(contact);
    return res.status(201).json({
        ...contact,
        id: contactId
    });
};

export const deleteContact = async (req, res) => {
    const { contactId } = req.params;
    const { userId: customerId } = req.auth;

    const deletedContact = await contactModel.getContactById(contactId);
    if (!deletedContact) {
        throw new HttpErrors.NotFound();
    }

    if (deletedContact.customerId !== customerId) {
        throw new HttpErrors.Forbidden();
    }

    await contactModel.deleteContact(contactId);
    return res.status(204).end();
};

export const patchContact = async (req, res) => {
    const { contactId } = req.params;
    const { userId: customerId } = req.auth;

    const patchedContact = await contactModel.getContactById(contactId);
    if (!patchedContact) {
        throw new HttpErrors.NotFound();
    }

    if (patchedContact.customerId !== customerId) {
        throw new HttpErrors.Forbidden();
    }

    const updateFields = _.pick(req.body, ['accountNumber', 'name']);
    await contactModel.updateContact(contactId, updateFields);
    return res.status(204).end();
};
