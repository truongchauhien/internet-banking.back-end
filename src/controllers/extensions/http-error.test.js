import { HttpErrorClasses, HttpError, __generateJsDocs__ } from './http-error.js';

try {
    // throw new HttpErrorClasses[403]();
    throw new HttpErrorClasses.Forbidden();
} catch (err) {
    if (err instanceof HttpError) {
        console.log(err.code);
        console.log(err.name);
    }

    console.log(err instanceof HttpError); // true
    console.log(err instanceof HttpErrorClasses.Forbidden); // true
    console.log(err instanceof HttpErrorClasses.BadRequest); // false
}

// console.log(HttpErrorClasses);

// __generateJsDocs__();
