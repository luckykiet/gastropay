# Gastro Pay

[![Netlify Status](https://api.netlify.com/api/v1/badges/4d432be8-de4f-4c1d-b14f-0c5c64e7c5c7/deploy-status)](https://app.netlify.com/sites/gastropay/deploys)

## Deployment

https://gastropay.ruano.cz/

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

4. Deployment on netlify

- Create netlify account
- Create site to deploy
- Set up **Enviroment Variables** same as **.env** file in _Settings/General_

```
yarn deploy-prod
```
