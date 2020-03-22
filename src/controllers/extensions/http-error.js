import { STATUS_CODES } from 'http';

export class HttpError extends Error {
    constructor(code, name, ...params) {
        super(...params);

        this.code = code;
        this.name = name;
    }
}

const generateHttpErrorClasses = () => {
    const classes = {};

    for (const code of Object.keys(STATUS_CODES)) {
        if (code < 400 || code > 599)
            continue;

        const name = STATUS_CODES[code].replace(/\s/g, '');
        const ____ = {
            [name]: class extends HttpError {
                constructor(...params) {
                    super(code, name, ...params);
                    Error.captureStackTrace(this, this.constructor);
                }
            }
        };
        classes[code] = classes[name] = ____[name];
    }

    return classes;
}

/**
 * @type
 * {{
 *      400: Function
 *      401: Function
 *      402: Function
 *      403: Function
 *      404: Function
 *      405: Function
 *      406: Function
 *      407: Function
 *      408: Function
 *      409: Function
 *      410: Function
 *      411: Function
 *      412: Function
 *      413: Function
 *      414: Function
 *      415: Function
 *      416: Function
 *      417: Function
 *      418: Function
 *      421: Function
 *      422: Function
 *      423: Function
 *      424: Function
 *      425: Function
 *      426: Function
 *      428: Function
 *      429: Function
 *      431: Function
 *      451: Function
 *      500: Function
 *      501: Function
 *      502: Function
 *      503: Function
 *      504: Function
 *      505: Function
 *      506: Function
 *      507: Function
 *      508: Function
 *      509: Function
 *      510: Function
 *      511: Function
 *      BadRequest: Function
 *      Unauthorized: Function
 *      PaymentRequired: Function
 *      Forbidden: Function
 *      NotFound: Function
 *      MethodNotAllowed: Function
 *      NotAcceptable: Function
 *      ProxyAuthenticationRequired: Function
 *      RequestTimeout: Function
 *      Conflict: Function
 *      Gone: Function
 *      LengthRequired: Function
 *      PreconditionFailed: Function
 *      PayloadTooLarge: Function
 *      URITooLong: Function
 *      UnsupportedMediaType: Function
 *      RangeNotSatisfiable: Function
 *      ExpectationFailed: Function
 *      I'maTeapot: Function
 *      MisdirectedRequest: Function
 *      UnprocessableEntity: Function
 *      Locked: Function
 *      FailedDependency: Function
 *      TooEarly: Function
 *      UpgradeRequired: Function
 *      PreconditionRequired: Function
 *      TooManyRequests: Function
 *      RequestHeaderFieldsTooLarge: Function
 *      UnavailableForLegalReasons: Function
 *      InternalServerError: Function
 *      NotImplemented: Function
 *      BadGateway: Function
 *      ServiceUnavailable: Function
 *      GatewayTimeout: Function
 *      HTTPVersionNotSupported: Function
 *      VariantAlsoNegotiates: Function
 *      InsufficientStorage: Function
 *      LoopDetected: Function
 *      BandwidthLimitExceeded: Function
 *      NotExtended: Function
 *      NetworkAuthenticationRequired: Function
 * }}
 */
export const HttpErrorClasses = generateHttpErrorClasses();

export const __generateJsDocs__ = () => {
    console.log('/**');
    console.log(' * @type');
    console.log(' * {{');
    for (const key of Object.keys(HttpErrorClasses)) {
        console.log(` *      ${key}: Function`);
    }
    console.log(' * }}');
    console.log(' */');
};
