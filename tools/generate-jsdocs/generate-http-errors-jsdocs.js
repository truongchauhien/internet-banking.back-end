import HttpErrors from "../../src/controllers/extensions/http-errors.js";

const __generateJsDocs__ = () => {
    console.log('/**');
    console.log(' * @type');
    console.log(' * {{');
    for (const key of Object.keys(HttpErrors)) {
        console.log(` *      ${key}: Function`);
    }
    console.log(' * }}');
    console.log(' */');
};

__generateJsDocs__();
