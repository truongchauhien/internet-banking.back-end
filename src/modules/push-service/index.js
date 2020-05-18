import * as customerPusher from './customer-pusher.js';
import * as administratorPusher from './administrator-pusher.js';

let isSetup = false;
export const setup = async () => {
    if (isSetup) return;
    await customerPusher.setup();
    await administratorPusher.setup();
    isSetup = true;
};

export const pushService = {
    customer: {
        notify: customerPusher.notify,
        notifyDebtCanceledByReceiver: customerPusher.notifyDebtCanceledByReceiver,
        notifyDebtCanceledBySender: customerPusher.notifyDebtCanceledBySender,
        notifyDebtCreated: customerPusher.notifyDebtCreated,
        notifyDebtPaid: customerPusher.notifyDebtPaid
    },
    administrator: {
        pushUpdate: administratorPusher.pushUpdate
    }
};

export default pushService;
