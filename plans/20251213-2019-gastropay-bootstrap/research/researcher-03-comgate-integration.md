# Comgate Payment Gateway Integration Research

**Date**: 2025-12-13
**Status**: Complete
**Priority**: Critical for Czech Market

---

## Executive Summary

Comgate is Czech Republic's leading payment provider with PCI DSS Level 1 certification. REST API supports 9 currencies, major card networks, and Czech-specific bank transfer methods. IP-whitelisting + HTTPS secures communications. Node.js SDK available via npm (`comgate-node`).

---

## 1. Comgate Overview

**Provider**: Comgate, a.s. (Czech National Bank licensed)
**Market**: Czech Republic, Poland, Slovakia, Central/Eastern Europe
**Security**: PCI DSS Level 1, processes ~40B CZK annually across 18,000+ e-shops
**Support**: +420 288 288 700 | podpora@comgate.cz | help.comgate.cz

### Pricing
- Promotional: 3 months free (Easy/Profi tiers, up to 500K CZK volume)
- Standard: 0-1% per transaction (tiered by volume)

---

## 2. API Architecture

### Authentication
- **Method**: IP address whitelisting (must register server IPv4 at portal.comgate.cz)
- **Transport**: HTTPS only
- **Credentials**: Merchant ID + Secret key (obtained after registration)

### Data Formats
- **Supported**: JSON, XML only
- **NOT supported**: multipart/form-data

### Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/create` | Initialize payment transaction |
| GET | `/status` | Verify payment status (polling) |
| POST | `/refund` | Process refunds |
| POST | `/cancel` | Cancel pending transactions |
| POST | `/capturePreauth` | Capture pre-authorized cards |
| GET | `/methods` | List available payment methods |
| POST | `/recurring` | Setup one-click recurring payments |

### Payment Creation Example

```json
POST /create
{
  "merchant": 12345,
  "secret": "abcdefgh",
  "price": 10000,           // in CZK
  "currency": "CZK",
  "label": "Order #12345",
  "refId": "unique-ref-id",
  "country": "CZ",
  "method": "ALL",          // or specific method code
  "email": "customer@example.com",
  "lang": "cs",             // Czech language
  "prepareOnly": false
}
```

**Response**: Payment reference, redirect URL, transaction ID

---

## 3. Payment Methods

### Card Payments
- VISA, VISA Electron, Mastercard, Maestro
- Pre-authorization support (reserve funds without capture)
- All major Czech card issuers supported

### Czech Bank Transfers (FAST)
- Česká spořitelna
- KB (Komerční banka)
- Raiffeisen Bank
- ING Bank
- UniCredit Bank
- Moneta
- Sberbank CZ
- mBank

### Other Methods
- Apple Pay, Google Pay (via Checkout SDK)
- International transfers

### Supported Currencies
CZK, EUR, PLN, HUF, USD, GBP, RON, NOK, SEK

---

## 4. Integration Flow

```
1. Customer initiates order (restaurant app)
   ↓
2. App calls /create endpoint
   - Sends: order amount, customer email, unique reference
   - Auth: Merchant ID + Secret
   ↓
3. Comgate returns redirect URL + transaction ID
   ↓
4. Redirect customer to Comgate payment page
   - Customer selects payment method (card/bank transfer)
   - Enters payment details on Comgate's PCI-DSS secure page
   ↓
5. Comgate processes payment (real-time)
   ↓
6. Callback notification sent to app's webhook endpoint
   - Contains transaction ID, status
   ↓
7. App receives notification, calls /status API to verify
   - Confirms payment success/failure
   - Updates order status in database
   ↓
8. Redirect customer to success/failure page
```

### Webhook Callback Structure

**Comgate sends HTTP POST** to merchant's configured callback URL:

```json
{
  "transactionId": "com_xxx_yyy",
  "status": "PAID",              // PAID, DENIED, CANCELLED
  "price": 10000,
  "refId": "order-12345"
}
```

**Security Note**: Webhook is IP-whitelisted (registered server only). No signature verification specified in docs; instead, merchants MUST call `/status` API to verify payment authenticity.

```javascript
// Verify by querying API (RECOMMENDED APPROACH)
const status = await comgate.getStatus(transactionId);
if (status.paid) {
  // Mark order as paid in database
}
```

---

## 5. Node.js Integration

### Official SDK: `comgate-node`

```bash
npm install comgate-node
```

**Requirements**: Node 18+

### Basic Setup

```typescript
import ComgateClient from "comgate-node"

const comgate = new ComgateClient({
  merchant: 12345,
  secret: "your-secret-key",
  test: true  // sandbox mode
})
```

### Create Payment

```typescript
const payment = await comgate.create({
  country: "CZ",
  price: 10000,        // cents (100 CZK = 10000)
  currency: "CZK",
  label: "Order #123",
  refId: "order-123",
  method: "ALL",       // payment method selector
  email: "user@example.com",
  lang: "cs",
  prepareOnly: false   // true = don't process yet
})

console.log(payment.redirect)  // Customer redirect URL
```

### Check Payment Status

```typescript
const status = await comgate.getStatus(transactionId)

if (status.paid) {
  // Payment confirmed - safe to fulfill order
}
```

### Other Methods

```typescript
await comgate.refund(transactionId)
await comgate.cancel(transactionId)
await comgate.methods()  // Get available methods
```

---

## 6. Security Considerations

### Mandatory Requirements
1. **IP Whitelisting**: Register app server IPv4 at portal.comgate.cz
2. **HTTPS Only**: All communication encrypted
3. **Merchant Credentials**: Keep secret key secure (env variables only)
4. **Status Verification**: ALWAYS call `/status` API after webhook callback (do not trust webhook alone)

### Sandbox vs Production
- **Test URL**: https://test-ssl.comgate.cz
- **Production URL**: https://secure.comgate.cz
- Switch via `test: true/false` in SDK config

### OWASP Compliance
- PCI DSS Level 1 handled by Comgate (card data never touches app)
- Prevent double-spending: check order status before fulfilling
- Rate limit webhook handler to prevent abuse

---

## 7. Implementation Checklist

- [ ] Register merchant account at comgate.cz
- [ ] Configure IP whitelist at portal.comgate.cz
- [ ] Install npm package: `comgate-node`
- [ ] Store merchant ID & secret in environment variables
- [ ] Implement `/api/payments/create` endpoint
- [ ] Implement webhook handler at `/api/payments/callback`
- [ ] Add `/status` verification in webhook handler
- [ ] Test in sandbox mode with test cards
- [ ] Implement retry logic for failed payments
- [ ] Setup logging for payment events (audit trail)
- [ ] Document customer-facing error messages
- [ ] Switch to production after UAT

---

## 8. Unresolved Questions

- **Webhook retry policy**: Does Comgate retry failed webhook deliveries? (Check docs)
- **Rate limiting**: Any API rate limits specified? (Default 60/min typical)
- **Recurring payment capture**: Maximum one-click frequency allowed?
- **Multi-currency handling**: Auto-conversion or manual selection?
- **3D Secure**: Mandatory for certain card types/amounts?

---

## References

- [Comgate API Documentation](https://apidoc.comgate.cz/en/)
- [REST API Reference](https://apidoc.comgate.cz/en/api/rest/)
- [Payment Methods](https://apidoc.comgate.cz/en/metody-platebni-brany/)
- [Payment Flow Diagram](https://apidoc.comgate.cz/en/prubeh-platby/)
- [comgate-node NPM](https://www.npmjs.com/package/comgate-node)
- [comgate-node GitHub](https://github.com/xGearForce/comgate-node)
- [Official Support](https://help.comgate.cz/docs/en/)
