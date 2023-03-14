const csob = {
    LANGUAGES: ['cs', 'en', 'de', 'fr', 'hu', 'it', 'ja', 'pl', 'pt', 'ro', 'ru', 'sk', 'es', 'tr', 'vi', 'hr', 'sl', 'sv'],
    CURRENCIES: ['CZK', 'EUR', 'PLN', 'HUF', 'USD', 'GBP', 'RON', 'NOK', 'SEK'],
    PAY_OPERATIONS: ['payment', 'oneclickPayment', 'customPayment'],
    PAYMENT_METHODS: ['card', 'card#LVP'],
    LANGUAGES_DISABLED: true,
    PAY_OPERATIONS_DISABLED: true,
    CURRENCIES_DISABLED: true,
    PAYMENT_METHODS_DISABLED: true,
    TIME_EXPIRATION: 1800,
    PRODUCTION_URL: "https://api.platebnibrana.csob.cz/api/v1.9",
    TEST_URL: "https://iapi.iplatebnibrana.csob.cz/api/v1.9",
    PRODUCTION_PUB: `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuU5Jy6+5d4AhtSMhk1jV
    872Jjfuux2MZxmnCSSI8InALOdnk74waJejQv+3mmPzKrcK/cP2Px2wVUlVlXCW1
    XyD6/OUz5lO/AgnFbS5kXTprfdimj998xv4D0HzHkpDosmuamEbN/T4/bj/o4sbk
    ABEYHUy3Bs0yLW8wstTfFz2hht5Q1qsUcTHpAslFz0qD+5BAOfl6fWJD6EjpCRBF
    Rgu+IU8ckToNQ/+pgG9Bxc1fz9Mmwu5D/5u2sFekAWjGJoyRkR7Ms8NHeQ2cKoLt
    sjDONUsoaOANnvMQMwEIr10u8U1HM+t57eY6pG2jG9zzAVJ+4DLq1fFFsgZvs4E4
    lwIDAQAB
    -----END PUBLIC KEY-----`,
    TEST_PRODUCTION_PUB: `-----BEGIN PUBLIC KEY-----
    MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuo0GzBCQMl1wDJJrJHTQ
    ykGlh2Kon7QfQjKVTPv7fPIVE8PhHeJueWBfydqTQKVeIVMB9VAUYlaPjwFhAuJ6
    zqoaCG9m+q81L7CehsQThntxacOPwRd4SSyS5o+kPzTIFji0Z3c8s6pYJJoF+YfE
    atCWRW2frgrgbHbl+84AOvItt7NReYz1z4P7J+Uv4UbifFHVP7oIEh+5CJSj6puv
    jHh1QHrzE+dTaoKDhtOfSkTTelHqod/hUt4QIcHai6I8X/R5nEv3y40MWoi1FxbQ
    6IgtVMloneN0XaHR5U88eMeKJJyqR859I4xfun6Z6RyfyaIl5Ph3f2daeMeENPUR
    BQIDAQAB
    -----END PUBLIC KEY-----`,
}
export { csob as CSOB };