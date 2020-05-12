import express from 'express';
import asyncWrapper from '../../middlewares/async-wrapper.js';
import selectHandlerByRole from '../../middlewares/select-handler-by-role.js';
import * as employeeController from '../../controllers/internal-controllers/employee-controller.js';

const router = express.Router();

router.get('/', selectHandlerByRole({
    administrator: asyncWrapper(employeeController.getEmployees)
}));
router.post('/', selectHandlerByRole({
    administrator: asyncWrapper(employeeController.createEmployee)
}));
router.patch('/:employeeId', selectHandlerByRole({
    administrator: asyncWrapper(employeeController.updateEmployee)
}));
router.delete('/:employeeId', selectHandlerByRole({
    administrator: asyncWrapper(employeeController.deleteEmployee)
}));

export default router;
