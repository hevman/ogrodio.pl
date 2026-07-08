import {
    dummyPaymentHandler,
    DefaultJobQueuePlugin,
    DefaultSchedulerPlugin,
    DefaultSearchPlugin,
    VendureConfig,
} from '@vendure/core';
import { defaultEmailHandlers, EmailPlugin, FileBasedTemplateLoader } from '@vendure/email-plugin';
import { AssetServerPlugin } from '@vendure/asset-server-plugin';
import { DashboardPlugin } from '@vendure/dashboard/plugin';
import { GraphiqlPlugin } from '@vendure/graphiql-plugin';
import 'dotenv/config';
import path from 'path';
import { LanguageCode } from '@vendure/core';

const IS_DEV = process.env.APP_ENV === 'dev';
const serverPort = +process.env.PORT || 3000;
const assetUrlPrefix = process.env.ASSET_URL_PREFIX || (IS_DEV ? undefined : 'https://sklep.ogrodio.pl/assets/');
const shopUrl = (process.env.SHOP_URL || 'https://sklep.ogrodio.pl').replace(/\/$/, '');
const trustProxy = process.env.TRUST_PROXY === 'true' ? 1 : IS_DEV ? false : 1;

const emailTemplateLoader = new FileBasedTemplateLoader(path.join(__dirname, '../static/email/templates'));
const emailGlobalTemplateVars = {
    fromAddress: process.env.SMTP_FROM || '"Ogrodio" <noreply@ogrodio.pl>',
    verifyEmailAddressUrl: `${shopUrl}/verify`,
    passwordResetUrl: `${shopUrl}/password-reset`,
    changeEmailAddressUrl: `${shopUrl}/verify-email-address-change`,
};
const emailTransport = (() => {
    const host = process.env.SMTP_HOST;
    if (!host) {
        return { type: 'none' as const };
    }
    return {
        type: 'smtp' as const,
        host,
        port: +(process.env.SMTP_PORT || 587),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER
            ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS || '' }
            : undefined,
    };
})();

export const config: VendureConfig = {
    apiOptions: {
        port: serverPort,
        adminApiPath: 'admin-api',
        shopApiPath: 'shop-api',
        trustProxy,
        // The following options are useful in development mode,
        // but are best turned off for production for security
        // reasons.
        ...(IS_DEV ? {
            adminApiDebug: true,
            shopApiDebug: true,
        } : {}),
    },
    authOptions: {
        tokenMethod: ['bearer', 'cookie'],
        superadminCredentials: {
            identifier: process.env.SUPERADMIN_USERNAME,
            password: process.env.SUPERADMIN_PASSWORD,
        },
        cookieOptions: {
          secret: process.env.COOKIE_SECRET,
        },
    },
    dbConnectionOptions: {
        type: 'postgres',
        // See the README.md "Migrations" section for an explanation of
        // the `synchronize` and `migrations` options.
        synchronize: process.env.DB_SYNCHRONIZE !== 'false',
        migrations: [path.join(__dirname, './migrations/*.+(js|ts)')],
        logging: false,
        host: process.env.DB_HOST || 'localhost',
        port: +(process.env.DB_PORT || 5432),
        username: process.env.DB_USERNAME || 'vendure',
        password: process.env.DB_PASSWORD || 'vendure',
        database: process.env.DB_NAME || 'vendure',
        schema: process.env.DB_SCHEMA || 'public',
    },
    paymentOptions: {
        paymentMethodHandlers: [dummyPaymentHandler],
    },
    // When adding or altering custom field definitions, the database will
    // need to be updated. See the "Migrations" section in README.md.
    customFields: {
        ProductVariant: [
            {
                name: 'weight',
                type: 'int',
                label: [{ languageCode: LanguageCode.pl, value: 'Waga (g)' }],
                ui: { tab: 'Shipping' },
            },
            {
                name: 'length',
                type: 'int',
                label: [{ languageCode: LanguageCode.pl, value: 'Długość (mm)' }],
                ui: { tab: 'Shipping' },
            },
            {
                name: 'width',
                type: 'int',
                label: [{ languageCode: LanguageCode.pl, value: 'Szerokość (mm)' }],
                ui: { tab: 'Shipping' },
            },
            {
                name: 'height',
                type: 'int',
                label: [{ languageCode: LanguageCode.pl, value: 'Wysokość (mm)' }],
                ui: { tab: 'Shipping' },
            },
        ],
    },
    plugins: [
        ...(IS_DEV ? [GraphiqlPlugin.init()] : []),
        AssetServerPlugin.init({
            route: 'assets',
            assetUploadDir: path.join(__dirname, '../static/assets'),
            // For local dev, the correct value for assetUrlPrefix should
            // be guessed correctly, but for production it will usually need
            // to be set manually to match your production url.
            assetUrlPrefix,
        }),
        DefaultSchedulerPlugin.init(),
        DefaultJobQueuePlugin.init({ useDatabaseForBuffer: true }),
        DefaultSearchPlugin.init({ bufferUpdates: false, indexStockStatus: true }),
        ...(IS_DEV
            ? [
                EmailPlugin.init({
                    devMode: true,
                    outputPath: path.join(__dirname, '../static/email/test-emails'),
                    route: 'mailbox',
                    handlers: defaultEmailHandlers,
                    templateLoader: emailTemplateLoader,
                    globalTemplateVars: emailGlobalTemplateVars,
                }),
            ]
            : [
                EmailPlugin.init({
                    handlers: defaultEmailHandlers,
                    templateLoader: emailTemplateLoader,
                    globalTemplateVars: emailGlobalTemplateVars,
                    transport: emailTransport,
                }),
            ]),
        DashboardPlugin.init({
            route: 'dashboard',
            appDir: IS_DEV
                ? path.join(__dirname, '../dist/dashboard')
                : path.join(__dirname, 'dashboard'),
        }),
    ],
};
