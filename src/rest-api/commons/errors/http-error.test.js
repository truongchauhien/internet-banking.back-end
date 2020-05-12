import HttpError from './http-error.js';
import {HttpErrors} from './http-errors.js';

try {
    // throw new HttpErrorClasses[403]();
    throw new HttpErrors.Forbidden();
} catch (err) {
    if (err instanceof HttpError) {
        console.log(err.code);
        console.log(err.name);
    }
    
    console.log(err instanceof HttpError); // true
    console.log(err instanceof HttpErrors.Forbidden); // true
    console.log(err instanceof HttpErrors.BadRequest); // false
}
