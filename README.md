# Gastro Pay

[![Netlify Status](https://api.netlify.com/api/v1/badges/4d432be8-de4f-4c1d-b14f-0c5c64e7c5c7/deploy-status)](https://app.netlify.com/sites/gastropay/deploys)

## Deployment

https://gastropay.ruano.cz/

## Supported Payment Gateways

#### [Comgate](https://help.comgate.cz/docs/en/protokol-api-en "Comgate")

#### [CSOB](https://github.com/csob/paymentgateway "CSOB")

## Installation

1. Dependencies installation

```
npm i -g yarn
yarn install
```

2. Set up the **.env** file in the*root directory* using the **.env.example** file as an example
3. Run app

```
yarn start
```

4. Deployment on Netlify

- Create a Netlify account
- Create a deployment site
- Go to **Site** > **Site settings** > **Enviroment Variables**
- Set up **Enviroment Variables** just like the **.env** file in _Settings/General_ or simply upload the **.env** file

```
yarn deploy-prod
```

## Merchant

1. Create a merchant account with a valid IČO
2. Login

### Add a Comgate payment gateway

1. Get a Comgate account and login to
   [Comgate Portal](https://portal.comgate.cz/ "Comgate Portal")
2. On main page go to **Integration** > **shops name** > **Shop connections** >
   **Add**
3. Add new shop, set **Connection name**
4. Add redirect URL **https:&#8203;//yourwebsitedomain/transaction/${refId}** to _Url paid_, _Url cancelled_, _Url pending_ and leave the tab open
5. On the merchant page of Gastro Pay go to **Více** > **Profile** > **Comgate**
6. Copy the IP Address from **Povolení IP adresy** and paste it into Comgate portal field **IP Whitelist**
7. Save and click to view the new shop
8. Copy and paste the value of **Shop connection identifier** to Gastro Pay **Merchant ID** field
9. Copy and paste the value of **Password** to Gastro Pay **secret** field
10. If you want to run a test payment first, keep the toggle **Testovací režim** on.
11. Save it

### Add a CSOB payment gateway

1. Get a ČSOB account and login to
   [Posman Portal](https://posman.csob.cz/ "Posman Portal")
2. Generate **Public** and **Private key** using the provided Merchant ID and
   registered E-mail on
   [this page](https://platebnibrana.csob.cz/keygen/ "this page")
3. On merchant page in Gastro Pay go to **Více** > **Profile** > **ČSOB**
4. Copy and paste the value of **Merchant ID** to Gastro Pay **Merchant ID** field
5. Copy and paste the contents of your **Private key** to Gastro Pay **Privátní klíč** field
6. Copy and paste the contents of your **Public key** to Gastro Pay **Veřejný klíč** field
7. If you want to run a test payment first, keep the toggle **Testovací režim** on.
8. Save it

### Create new restaurant

1. On the merchant's main page, in the "Restaurace" panel click on **Přidat** button
2. Type the name, address of the restaurant and create a new restaurant.
3. Add a profile picture, set the opening hours
4. Click on the toggle **Aktivní** to enable the restaurant
5. Save it

### Connect to POS

- Gastro Pay sends **GET** method to load the Menu
- Gastro Pay sends **POST** method to verify connection and submit the orders to
  the POS

1. Select the restaurant you want to connect to
2. Scroll down to **Menu API** section
3. As a **Key** add your POS API ID
4. Add URL of your API
5. Choose _Content type_ of your API requests
6. You can test _Menu_ using button **Test Menu API**
7. Gastro Pay sends request as examples in
   [API examples folder](https://github.com/luckykiet/gastropay/tree/main/examples "API examples folder")
8. To request transaction status, follow
   [this API](https://app.swaggerhub.com/apis/luckykiet/GastroPay/1.0.0 "this API documentation")
9. Save it
