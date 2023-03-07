const fetch = require('node-fetch').default;
const fs = require('node:fs');
const wait = require('util').promisify(setTimeout);

const baseURL = 'https://api.twitch.tv/helix/';

const json = require('../config.json');
const { client_id, client_secret } = require('../config.json');

async function get(url) {
    const fuck = await fetch(`${baseURL}${url}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${json.token.access_token}`,
            "Client-Id": client_id
        }
    });

    if(fuck.status == 401) {
        getAccessToken();
        await wait(15000);
        get(url);
    }

    return await fuck.json();
}

async function post(url, headers, data) {
    headers = {
        "Authorization": `Bearer ${json.token.access_token}`,
        "Client-Id": client_id,
        ...headers
    }
    const fuck = await fetch(`${baseURL}${url}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
    });

    if(fuck.status == 401) {
        getAccessToken();
        await wait(15000);
        post(url, headers, data);
    }

    return fuck;
}

async function getAccessToken() {
    console.log(`Please click on the link below, whatever was tried to run will try again in 15 seconds. If it succeeded you'll be redirected to twitch`);
    console.log(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${json.client_id}&redirect_uri=${encodeURIComponent(`http://localhost/api`)}&scope=moderator%3Aread%3Afollowers`);
}

module.exports = {get, post}