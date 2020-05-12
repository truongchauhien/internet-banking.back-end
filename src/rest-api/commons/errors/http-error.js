import { STATUS_CODES } from 'http';

export class HttpError extends Error {
    constructor(code, name, meta) {
        super(STATUS_CODES[code] || '');

        this.code = code;
        this.name = name;
        this.meta = meta;
    }
}

export default HttpError;
