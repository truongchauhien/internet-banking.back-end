import _ from 'lodash';
import HttpErrors from '../../commons/errors/http-errors.js';
import BANKS from '../../../models/constants/banks.js';
import * as contactModel from '../../../models/contact-model.js';
import * as customerModel from '../../../models/customer-model.js';

export const getContacts = async (req, res) => {
    const { userId: customerId } = req.auth;
    const contacts = await contactModel.findAllContacts(customerId);

    return res.status(200).json({
        contacts: contacts
    });
};

export const createContact = async (req, res) => {
    const { userId: customerId } = req.auth;
    const { accountNumber, name: customContactName, bankId = BANKS.INTERNAL } = req.body;

    if (!accountNumber) throw new HttpErrors.BadRequest('Bad account number');

    let contactRealName = null;
    if (!customContactName) {
        if (bankId == BANKS.INTERNAL) {
            const internalCustomer = await customerModel.getByAccountNumber(accountNumber);
            if (internalCustomer) {
                contactRealName = internalCustomer.fullName;
            }
        } else {
            // TODO: Query holder name of account number here.
        }
    }

    const contact = {
        accountNumber,
        name: customContactName || contactRealName || 'Unknown Contact Name',
        bankId,
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

    const updateFields = _.pick(req.body, ['accountNumber', 'name', 'bankId']);
    if (updateFields.bankId === null) throw new HttpErrors.BadRequest('Bad bank id.');

    const contact = await contactModel.getContactById(contactId);
    if (!contact) {
        throw new HttpErrors.NotFound();
    }

    if (contact.customerId !== customerId) {
        throw new HttpErrors.Forbidden();
    }
    
    if (updateFields?.name === '') {
        if (updateFields?.bankId == BANKS.INTERNAL ||
            updateFields?.bankId === undefined && contact.bankId === BANKS.INTERNAL) {
                const internalCustomer = await customerModel.getByAccountNumber(updateFields?.accountNumber || contact.accountNumber);
                updateFields.name = internalCustomer?.fullName || 'Unknown Contact Name';
        }
    }

    await contactModel.updateContact(contactId, updateFields);
    const updatedContact = await contactModel.getContactById(contactId);
    return res.status(200).json({
        contact: updatedContact
    });
};
