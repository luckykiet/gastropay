import { isOpening, calculateCart, checkICO, addSlashAfterUrl, removeSlashFromUrl, stringToValidFilename, isValidUrl } from "../utils";

describe('isOpening', () => {
    test('returns true if current time is between opening and closing time', () => {
        let isOpen = isOpening('09:00', '17:00');
        expect(isOpen).toBe(true);
        isOpen = isOpening('10:00', '17:00');
        expect(isOpen).toBe(true);
    });

    test('returns false if current time is outside opening and closing time', () => {
        let isOpen = isOpening('9:60', '24:00');
        expect(isOpen).toBe(false);
        isOpen = isOpening('9:00', '17:00');
        expect(isOpen).toBe(false);
        isOpen = isOpening('01:00', '02:00');
        expect(isOpen).toBe(false);
        isOpen = isOpening('1:00', '02:00');
        expect(isOpen).toBe(false);
    });
});

describe('calculateCart', () => {
    test('returns the correct total quantity and price', () => {
        const cartItems = [{ id: 1, quantity: 2, price: '10.99' }, { id: 2, quantity: 1, price: '5.99' },];
        const cart = calculateCart(cartItems);
        expect(cart.totalQuantity).toBe(3);
        expect(cart.totalPrice).toBe(28);
    });
});

describe('checkICO', () => {
    test('returns true for a valid ICO', () => {
        let ico = 26168685;
        expect(checkICO(ico)).toBe(true);
        ico = '26168685';
        expect(checkICO(ico)).toBe(true);
        ico = '27767680';
        expect(checkICO(ico)).toBe(true);
    });

    test('returns false for an invalid ICO', () => {
        let ico = '12345678';
        expect(checkICO(ico)).toBe(false);
        ico = '1234567';
        expect(checkICO(ico)).toBe(false);
        ico = '123456789';
        expect(checkICO(ico)).toBe(false);
        ico = '1a345678';
        expect(checkICO(ico)).toBe(false);
        ico = '12345679';
        expect(checkICO(ico)).toBe(false);
        ico = null;
        expect(checkICO(ico)).toBe(false);
        ico = 26168681;
        expect(checkICO(ico)).toBe(false);
        ico = '26168681';
        expect(checkICO(ico)).toBe(false);
    });
});

describe('addSlashAfterUrl', () => {
    test('adds a slash to the end of the URL if it does not have one', () => {
        const url = addSlashAfterUrl('http://ruano.cz');
        expect(url).toBe('http://ruano.cz/');
    });

    test('does not add a slash if the URL already ends with one', () => {
        let url = addSlashAfterUrl('http://ruano.cz/');
        expect(url).toBe('http://ruano.cz/');
        url = addSlashAfterUrl('ruano');
        expect(url).toBe('ruano/');
    });
});

describe('removeSlashFromUrl', () => {
    test('removes a trailing slash from the URL', () => {
        const url = removeSlashFromUrl('http://ruano.cz/');
        expect(url).toBe('http://ruano.cz');
    });

    test('does not modify the URL if it does not have a trailing slash', () => {
        let url = removeSlashFromUrl('http://ruano.cz');
        expect(url).toBe('http://ruano.cz');
        url = addSlashAfterUrl('ruano');
        expect(url).toBe('ruano');
    });
});

describe('stringToValidFilename', () => {
    test('replaces invalid characters with underscores', () => {
        const str = stringToValidFilename('My/ Filename :is?*Invalid"');
        expect(str).toBe('My__ Filename_-is__Invalid_');
    });

    test('does not modify valid characters', () => {
        const str = stringToValidFilename('MyValidFilename123.jpg');
        expect(str).toBe('MyValidFilename123.jpg');
    });
});

describe('isValidUrl', () => {
    test('returns true for a valid URL', () => {
        let isValid = isValidUrl('http://ruano.cz');
        expect(isValid).toBe(true);
        isValid = isValidUrl('https://ruano.cz');
        expect(isValid).toBe(true);
        isValid = isValidUrl('ruano.cz');
        expect(isValid).toBe(true);
        isValid = isValidUrl('www.ruano.cz');
        expect(isValid).toBe(true);
        isValid = isValidUrl('www.gastropay.ruano.cz');
        expect(isValid).toBe(true);
        isValid = isValidUrl('https://ruano.cz:8000/restaurant?search=hanoi');
        expect(isValid).toBe(true);
        isValid = isValidUrl('https://ruano.cz:8000');
        expect(isValid).toBe(true);
    });

    test('returns false for an invalid URL', () => {
        let isValid = isValidUrl('not a valid URL');
        expect(isValid).toBe(false);
        isValid = isValidUrl('http:/ruano.cz');
        expect(isValid).toBe(false);
        isValid = isValidUrl('https://ruano');
        expect(isValid).toBe(false);
        isValid = isValidUrl('https://ruano.cz/sadsa@');
        expect(isValid).toBe(false);
    });
});