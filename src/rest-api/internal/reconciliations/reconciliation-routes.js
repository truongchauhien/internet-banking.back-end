import express from 'express';
import selectHandlerByRole from '../../commons/middlewares/select-handler-by-role.js';
import asyncWrapper from '../../commons/middlewares/async-wrapper.js';
import verifyAccessToken from '../../commons/middlewares/verify-access-token.js';
import * as reconciliationController from './reconciliation-controller.js';

const router = express.Router();

// Temporarily accept download request without checking authentication and authorization.
router.get('/:identity', reconciliationController.downloadReconciliation);

router.use(asyncWrapper(verifyAccessToken));
router.get('/', reconciliationController.getReconciliations);
router.post('/', selectHandlerByRole({
    administrator: asyncWrapper(reconciliationController.createReconciliation)
}));
router.delete('/:identity', selectHandlerByRole({
    administrator: asyncWrapper(reconciliationController.deleteReconciliation)
}));

export default router;
