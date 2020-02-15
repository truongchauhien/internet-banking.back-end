import dotenv from 'dotenv';
import convict from 'convict';

dotenv.config();

const configSchema = convict({
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
        userName: {
            default: 'root'
        },
        password: {
            default: ''
        },
        name: {
            default: 'InternetBanking'
        }
    }
});

const env = configSchema.get('env');
configSchema.loadFile(`./config.${env}.json`);
configSchema.validate({ allowed: 'strict' });

export default configSchema;
