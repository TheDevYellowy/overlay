const fetch = require('node-fetch').default;
const wait = require('util').promisify(setTimeout);

const baseURL = 'https://api.twitch.tv/helix/';

async function get(url) {
    const json = requireConfig();
    const fuck = await fetch(`${baseURL}${url}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${json.token.access_token}`,
            "Client-Id": json.client_id
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
    const json = requireConfig();
    headers = {
        "Authorization": `Bearer ${json.token.access_token}`,
        "Client-Id": json.client_id,
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
    const json = requireConfig();
    console.log(`Please click on the link below, whatever was tried to run will try again in 15 seconds. If it succeeded you'll be redirected to twitch`);
    console.log(`https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=${json.client_id}&redirect_uri=${encodeURIComponent(`http://localhost/api`)}&scope=moderator%3Aread%3Afollowers`);
}

function requireConfig() {
    delete require.cache[require.resolve(`${process.cwd()}/config.json`)];
    return require(`${process.cwd()}/config.json`);
}

module.exports = {get, post}