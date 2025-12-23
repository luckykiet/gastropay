# ChoiQR-like Web Ordering System: Feature Research
**Date**: 2025-12-13 | **Focus**: MVP feature prioritization for GastroPay

## Executive Summary
QR-based table ordering systems (Mr.Yum, me&u) dominate this space. ChoiQR appears to be industry jargon/Choice QR variant. Core value: eliminate friction, increase AOV 20-40%, reduce labor 5-15%.

---

## Customer-Facing Features (Priority: MUST-HAVE)

### Core Ordering
- **App-free QR access** - No download/registration required. Scan → Order → Pay
- **Unique table QR codes** - Embedded table numbers prevent manual entry errors
- **Real-time menu display** - Prices, images, availability status
- **Customization options** - Modifiers (size, toppings), special instructions
- **Individual payment** - Split bills per customer or combined table tab
- **Order batching** - Multiple table orders combined in kitchen, individual payments preserved
- **SMS/push notifications** - Order ready alerts, status updates

### User Experience
- **Fast checkout** - <2min from scan to payment
- **Mobile-optimized** - Responsive design for all phone sizes
- **Dietary/allergy filters** - Vegetarian, vegan, gluten-free marking
- **Item availability toggle** - Real-time "out of stock" updates
- **Order history** - Repeat orders for frequent customers

---

## Restaurant Owner Features (Priority: HIGH)

### Menu Management
- **Visual menu builder** - Drag-drop UI, image uploads, categorization
- **Dynamic pricing** - Set discounts, seasonal items, combo meals
- **Ingredient-level tracking** - Disable items quickly when supplies run out
- **Multi-location support** - Manage menus across venues

### Operations
- **Kitchen display system (KDS)** - Order queue by table/time, prep tracking
- **Table management** - Occupied/available status, average stay time
- **Labor optimization** - Reduced server load, staff focus on delivery/upsell
- **Inventory sync** - Manual or POS integration (Square, Toast)

### Business Intelligence
- **Sales analytics** - Orders/revenue by time, item popularity, AOV trends
- **Customer CRM** - Phone numbers, repeat visit tracking, preferences
- **Loyalty programs** - Basic reward points, repeat discount triggers
- **Data capture** - Customer email/phone for marketing

### Payments
- **Multi-gateway support** - Stripe, Square, local gateways (critical for Vietnam market)
- **Table tabs** - Start/close tab, itemized bills
- **Security** - 3D Secure, chargeback protection, fraud detection
- **Settlement** - Automatic payouts, transparent fee structure

---

## System Admin Features (Priority: MEDIUM)

### Multi-Tenant Architecture
- **Restaurant onboarding** - Self-service signup, custom branding
- **Subscription tiers** - Usage-based or flat pricing
- **White-label support** - Custom domain, logo, colors

### Platform Management
- **User role management** - Owner, manager, staff, customer permissions
- **Audit logs** - Transaction history, menu changes, user actions
- **API access** - Third-party integrations (delivery platforms, loyalty)
- **Support/helpdesk** - Ticket system, documentation

---

## Payment Flow Considerations

### Critical Decisions
1. **Single vs Multi-Currency** - VND/USD/SGD for regional expansion
2. **Online vs Offline** - Handle connectivity loss gracefully
3. **Compliance** - PCI DSS, local payment regulations (Vietnam)
4. **Settlement Speed** - Daily/weekly payouts impact cash flow

### Recommended Architecture
```
Customer → Stripe/Local Gateway → Restaurant Settlement
                ↓
        Fraud Detection Layer
```

---

## Security Essentials

- **Data isolation** - Restaurant data strictly separated (multi-tenant)
- **Rate limiting** - Prevent menu scraping, API abuse
- **Customer privacy** - Encrypted phone/email storage, GDPR/PDPA compliance
- **Payment tokenization** - Never store full card numbers
- **JWT authentication** - Stateless API tokens for mobile clients

---

## MVP Feature Set (Phase 1)

### Must-Have
1. QR code generation with unique table identifiers
2. Mobile-responsive menu display
3. Basic customization (2-3 modifiers per item)
4. One-click checkout
5. Single payment gateway (Stripe initially)
6. Kitchen display system (simple queue view)
7. Restaurant admin dashboard (menu + analytics basic)

### Nice-to-Have (Phase 2)
- Loyalty programs
- Multiple payment gateways
- Delivery integration
- Advanced analytics
- SMS notifications

---

## Competitive Positioning vs. Incumbents

| Feature | Mr.Yum/me&u | GastroPay MVP | Advantage |
|---------|-------------|---------------|-----------|
| App requirement | None | None | ✓ Parity |
| AOV lift claimed | 20-40% | TBD | - |
| Labor savings | 5-15% | TBD | - |
| Multi-tenant | Yes | Yes | ✓ Required |
| Local payment support | Stripe-heavy | Focus Vietnam | ✓ Regional edge |
| Setup complexity | Medium | Simple | ✓ Opportunity |
| Merge/consolidation | Active M&A | N/A | ✓ Fragmentation |

---

## Unresolved Questions

1. **Vietnam market payment preferences** - Does Momo/ZaloPay matter more than Stripe?
2. **Offline fallback strategy** - How to handle connectivity loss in Vietnam restaurants?
3. **Kitchen hardware** - Thermal printer requirements for KDS output?
4. **Cost model** - SaaS per-restaurant or per-transaction?
5. **Language support** - Vietnamese UI critical day 1?

---

## Sources
- [Choice QR online menu service](https://choiceqr.com/)
- [Mr Yum - Leading QR Code for Table Ordering](https://www.mryum.com/qr-code-table-ordering)
- [me&u Order & Pay System](https://www.meandu.com/serve/order-pay)
- [QR Code Menu Ordering Trends 2025](https://orders.co/blog/the-future-of-qr-menus-emerging-trends-to-watch/)
- [Square Mr Yum Integration](https://squareup.com/au/en/the-bottom-line/inside-square/mr-yum-integration-au)
