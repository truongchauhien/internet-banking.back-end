import bcrypt from 'bcrypt';
import _ from 'lodash';
import * as employeeModel from '../../../models/employee-model.js';
import HttpErrors from '../extensions/http-errors.js';

export const getEmployees = async (req, res) => {
    const employees = await employeeModel.getAll();
    res.status(200).json({
        employees: employees
    });
};

export const createEmployee = async (req, res) => {
    const employee = _.pick(req.body, ['userName', 'password', 'fullName', 'email']);
    employee.password = await bcrypt.hash(employee.password, 12);
    const createdEmployee = await employeeModel.createEmployee(employee);
    return res.status(201).json({
        employee: _.omit(createdEmployee, ['password', 'refreshToken'])
    });
};

export const updateEmployee = async (req, res) => {
    const { employeeId } = req.params;
    if (!employeeId) throw new HttpErrors.BadRequest();

    const employee = employeeModel.getById(employeeId);
    if (!employee) throw new HttpErrors.NotFound();

    const updateFields = _.pick(req.body, ['userName', 'password', 'fullName', 'email']);
    if (updateFields.password) {
        updateFields.password = await bcrypt.hash(updateFields.password, 12);
    }
    await employeeModel.update(employeeId, updateFields);

    return res.status(204).end();
};

export const deleteEmployee = async (req, res) => {
    const { employeeId } = req.params;
    if (!employeeId) throw new HttpErrors.BadRequest();

    const employee = await employeeModel.getById(employeeId);
    if (!employee) throw new HttpErrors.NotFound();

    await employeeModel.remove(employee.id);

    return res.status(204).end();
};
