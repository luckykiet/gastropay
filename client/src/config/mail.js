const mail = {
    USE_SEND_MAIL: process.env.USE_SEND_MAIL === 'true',
    HOST: process.env.MAIL_HOST,
    PORT: process.env.MAIL_PORT,
    USE_TLS: process.env.MAIL_USE_TLS === 'true',
    USERNAME: process.env.MAIL_USERNAME,
    PASSWORD: process.env.MAIL_APP_PASSWORD,
    FROM_ADDRESS: process.env.MAIL_FROM_ADDRESS,
    FROM_NAME: process.env.MAIL_FROM_NAME,
}
export { mail as MAIL };