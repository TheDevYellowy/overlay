const fetch = require('node-fetch').default;
const fs = require('node:fs');

const baseURL = 'https://api.twitch.tv/helix/';

const json = require('./config.json');
const { client_id, client_secret } = require('./config.json');

async function get(url) {
    const fuck = await fetch(`${baseURL}${url}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${json.token.access_token}`,
            "Client-Id": client_id
        }
    });

    if(fuck.status == 401) {
        await getAccessToken();
        get(url);
    }

    return await fuck.json();
}

async function getAccessToken() {
    const res = await fetch(`https://id.twitch.tv/oauth2/token?client_id=${client_id}&client_secret=${client_secret}&grant_type=client_credentials`, {
        method: 'POST'
    });
    const tokens = await res.json();
    json.token = tokens;
    fs.writeFileSync('./config.json', JSON.stringify(json, null, 4));
}

module.exports = {get}