export class MySqlError extends Error {
    constructor(error, ...params) {
        super(...params);
        Error.captureStackTrace(this, MySqlError);
        this.name = 'MySqlError';

        this.code = error.code;
        this.errno = error.errno;
        this.fatal = error.fatal;
        this.sql = error.sql;
        this.sqlState = error.sqlState;
        this.sqlMessage = error.sqlMessage;

        this.error = error;
    }
}

export default MySqlError;
