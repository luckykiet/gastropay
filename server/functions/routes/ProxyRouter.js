const express = require('express');
const router = express.Router();
const axios = require('axios');
const PROXY = require('../config/api').PROXY;

//Licence: https://github.com/nvbach91/cors-proxy

const handleException = (e, res) => {
    res.status(e.response ? e.response.status : 400).json(e.response ? e.response.data : e.message || e);
};

router.get('/' + PROXY + '/get', async (req, res) => {
    console.log('GET query', req.query.url);
    const config = {};
    if (req.get('accept')) {
        config.headers = { 'accept': req.get('accept') };
    }
    try {
        const resp = await axios.get(req.query.url, config);
        res.json(resp.data);
    } catch (e) {
        handleException(e, res);
    }
});

router.get('/' + PROXY + '/:url', async (req, res) => {
    console.log("first")
    console.log('GET param', req.params.url);
    try {
        const resp = await axios.get(req.params.url);
        res.json(resp.data);
    } catch (e) {
        handleException(e, res);
    }
});

router.post('/' + PROXY + '/', async (req, res) => {
    console.log('POST', req.body.url, req.body.data, req.body.headers);
    const config = {
        headers: {},
    };
    try {
        if (req.body.headers) {
            const customHeaders = JSON.parse(req.body.headers);
            Object.keys(customHeaders).forEach((key) => {
                config.headers[key] = customHeaders[key];
            });
        }
        const data = req.body.data ? JSON.parse(req.body.data) : {};
        const resp = await axios.post(req.body.url, data, config);
        res.json({ status: resp.status, data: resp.data });
    } catch (e) {
        handleException(e, res);
    }
});

router.patch('/' + PROXY + '/', async (req, res) => {
    console.log('PATCH', req.body.url, req.body.data);
    try {
        const resp = await axios.patch(req.body.url, req.body.data ? JSON.parse(req.body.data) : {});
        res.json(resp.data);
    } catch (e) {
        handleException(e, res);
    }
});

router.put('/' + PROXY + '/', async (req, res) => {
    console.log('PUT', req.body.url, req.body.data);
    try {
        const resp = await axios.put(req.body.url, req.body.data ? JSON.parse(req.body.data) : {});
        res.json(resp.data);
    } catch (e) {
        handleException(e, res);
    }
});

router.delete('/' + PROXY + '/', async (req, res) => {
    console.log('DELETE', req.body.url);
    try {
        const resp = await axios.delete(req.body.url);
        res.json(resp.data);
    } catch (e) {
        handleException(e, res);
    }
});

module.exports = router;