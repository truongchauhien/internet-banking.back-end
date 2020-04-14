export class TransactionCanceled extends Error {
    constructor(meta) {
        super('Transaction is canceled.');

        this.name = 'TransactionCanceled';
        this.meta = meta;
    }
}

export default TransactionCanceled;
