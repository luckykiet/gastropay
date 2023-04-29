# Gastro Pay

[![Netlify Status](https://api.netlify.com/api/v1/badges/4d432be8-de4f-4c1d-b14f-0c5c64e7c5c7/deploy-status)](https://app.netlify.com/sites/gastropay/deploys)

## Deployment

https://gastropay.ruano.cz/

## Supported Payment Gateways

#### [Comgate](https://help.comgate.cz/docs/en/protokol-api-en "Comgate")

#### [CSOB](https://github.com/csob/paymentgateway "CSOB")

## Instalation

1. Install dependencies

```
npm i -g yarn
yarn install
```

2. Set up .env file in _root directory_ using **.env.example** file as example
3. Run app

```
yarn start
```

4. Deployment on Netlify

- Create Netlify account
- Create site to deploy
- Go to **Site** > **Site settings** > **Enviroment Variables**
- Set up **Enviroment Variables** same as **.env** file in _Settings/General_ or just simply upload the **.env** file

```
yarn deploy-prod
```

## Merchant

1. Create a merchant account with valid IČO
2. Login

### Add payment method Comgate

1. Get an Comgate account and login to
   [Comgate Portal](https://portal.comgate.cz/ "Comgate Portal")
2. On main page go to **Integration** > **shops name** > **Shop connections** >
   **Add**
3. Add new shop, set **Connection name**
4. Add redirect URL **https:&#8203;//yourwebsitedomain/transaction/${refId}** to
   _Url paid_, _Url cancelled_, _Url pending_ and keep the tab open
5. On merchant page of Gastro Pay go to **Více** > **Profile** > **Comgate**
6. Copy IP Address from **Povolení IP adresy** and paste to Comgate tab **IP
   Whitelist**
7. Save and click to view the new shop
8. Copy and paste **Shop connection identifier** value to Gastro Pay **Merchant
   ID** field
9. Copy and paste **Password** value to Gastro Pay **secret** field
10. If you want to run a test payment first, keep the toggle Testovací režim on.
11. Save it

### Add payment method CSOB

1. Get an ČSOB account and login to
   [Posman Portal](https://posman.csob.cz/ "Posman Portal")
2. Generate **Public** and **Private key** using provided Merchant ID and
   registered E-mail on
   [this page](https://platebnibrana.csob.cz/keygen/ "this page")
3. On merchant page of Gastro Pay go to **Více** > **Profile** > **ČSOB**
4. Copy and paste **Merchant ID** value to Gastro Pay **Merchant ID** field
5. Copy and paste contents of your **Private key** to Gastro Pay **Privátní
   klíč** field
6. Copy and paste contents of your **Public key** to Gastro Pay **Veřejný klíč**
   field
7. If you want to run a test payment first, keep the toggle Testovací režim on.
8. Save it

### Create new restaurant

1. On main merchant page under "Restaurace" panel click on **Přidat** button
2. Write name, address of your restaurant and create new restaurant
3. Add profile image, set opening time
4. Click on toggle **Aktivní** to enable the restaurant
5. Save it

### Connect to POS

- Gastro Pay will SEND **GET** method to load the Menu
- Gastro Pay will SEND **POST** method to verify connection and submit the orders to
  the POS

1. Choose a restaurant, where you want to connect to
2. Move down to **Menu API** section
3. As a **Key** add your POS API ID
4. Add URL of your API
5. Choose Content type of requests
6. You can test Menu using button **Test Menu API**
7. On your API side, set API structure answers as the examples in
   [API examples folder](https://github.com/luckykiet/gastropay/tree/main/examples "API examples folder")
8. To request transaction status, follow
   [this API](https://app.swaggerhub.com/apis/luckykiet/GastroPay/1.0.0 "this API")
9. Save it
