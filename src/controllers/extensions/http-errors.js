import { STATUS_CODES } from 'http';
import HttpError from './http-error.js';

const generateHttpErrors = () => {
    const errors = {};

    for (const code of Object.keys(STATUS_CODES)) {
        if (code < 400 || code > 599)
            continue;

        const name = STATUS_CODES[code].replace(/\s/g, '');
        const ____ = {
            [name]: class extends HttpError {
                constructor(meta) {
                    super(code, name, meta);
                    Error.captureStackTrace(this, this.constructor);
                    // 'this' will be automatically binded to a proper object by 'new' operator.
                }
            }
        };
        errors[code] = errors[name] = ____[name];
    }

    return errors;
}

/**
 * @type
 * {{
 *      400: function
 *      401: function
 *      402: function
 *      403: function
 *      404: function
 *      405: function
 *      406: function
 *      407: function
 *      408: function
 *      409: function
 *      410: function
 *      411: function
 *      412: function
 *      413: function
 *      414: function
 *      415: function
 *      416: function
 *      417: function
 *      418: function
 *      421: function
 *      422: function
 *      423: function
 *      424: function
 *      425: function
 *      426: function
 *      428: function
 *      429: function
 *      431: function
 *      451: function
 *      500: function
 *      501: function
 *      502: function
 *      503: function
 *      504: function
 *      505: function
 *      506: function
 *      507: function
 *      508: function
 *      509: function
 *      510: function
 *      511: function
 *      BadRequest: function
 *      Unauthorized: function
 *      PaymentRequired: function
 *      Forbidden: function
 *      NotFound: function
 *      MethodNotAllowed: function
 *      NotAcceptable: function
 *      ProxyAuthenticationRequired: function
 *      RequestTimeout: function
 *      Conflict: function
 *      Gone: function
 *      LengthRequired: function
 *      PreconditionFailed: function
 *      PayloadTooLarge: function
 *      URITooLong: function
 *      UnsupportedMediaType: function
 *      RangeNotSatisfiable: function
 *      ExpectationFailed: function
 *      "I'maTeapot": function
 *      MisdirectedRequest: function
 *      UnprocessableEntity: function
 *      Locked: function
 *      FailedDependency: function
 *      TooEarly: function
 *      UpgradeRequired: function
 *      PreconditionRequired: function
 *      TooManyRequests: function
 *      RequestHeaderFieldsTooLarge: function
 *      UnavailableForLegalReasons: function
 *      InternalServerError: function
 *      NotImplemented: function
 *      BadGateway: function
 *      ServiceUnavailable: function
 *      GatewayTimeout: function
 *      HTTPVersionNotSupported: function
 *      VariantAlsoNegotiates: function
 *      InsufficientStorage: function
 *      LoopDetected: function
 *      BandwidthLimitExceeded: function
 *      NotExtended: function
 *      NetworkAuthenticationRequired: function
 * }}
 */
export const HttpErrors = generateHttpErrors();
export default HttpErrors;
