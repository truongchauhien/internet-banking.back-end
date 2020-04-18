import dotenv from 'dotenv';
import convict from 'convict';

dotenv.config();

const configs = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development'],
        default: 'development',
        env: 'NODE_ENV'
    },
    port: {
        default: 3000,
        env: 'PORT'
    },
    database: {
        host: {
            default: 'localhost',
        },
        port: {
            default: 3306,
            format: 'port'
        },
        user: {
            default: 'root'
        },
        password: {
            default: ''
        },
        name: {
            default: 'InternetBanking'
        }
    },
    tokenSecretKey: {
        default: 'shhhhh'
    },
    recaptchaSecretKey: {
        default: ''
    },
    smtp: {
        host: {
            default: 'localhost'
        },
        port: {
            format: 'port',
            default: 578
        },
        secure: {
            format: Boolean,
            default: false
        },
        auth: {
            user: {
                format: 'String',
                default: null
            },
            pass: {
                format: 'String',
                default: null
            }
        }
    },
    emailSenders: {
        otp: {
            default: 'otp-nonreply@mail.test-bank.vn'
        }
    },
    rabbitMQ: {
        host: 'localhost',
        port: 5672,
        user: 'guest',
        pass: 'guest'
    }
});

const env = configs.get('env');
configs.loadFile(`./config.${env}.json`);
configs.validate({ allowed: 'strict' });

export default configs;
