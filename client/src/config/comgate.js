const comgate = {
    COUNTRIES: ['ALL', 'AT', 'BE', 'CY', 'CZ', 'DE', 'EE', 'EL', 'ES', 'FI', 'FR', 'GB', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'NO', 'PL', 'PT', 'RO', 'SL', 'SK', 'SV', 'US'],
    CURRENCIES: ['CZK', 'EUR', 'PLN', 'HUF', 'USD', 'GBP', 'RON', 'NOK', 'SEK'],
    METHODS: ['ALL', 'CARD_ALL', 'BANK_ALL'],
    COUNTRIES_DISABLED: true,
    CURRENCIES_DISABLED: true,
    METHODS_DISABLED: true,
    CREATE_URL: "https://payments.comgate.cz/v1.0/create",
    STATUS_URL: "https://payments.comgate.cz/v1.0/status"
}

export { comgate as COMGATE };