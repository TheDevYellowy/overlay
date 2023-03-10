const ws = new WebSocket('ws://localhost:2020');
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)) };

ws.addEventListener('open', (_) => {
    ws.send('alerts');
});

ws.addEventListener('message', async (msg) => {
    const data = JSON.parse(msg.data);
    const event = document.getElementsByClassName('event')[0];
    const eData = document.getElementsByClassName('data')[0];
    
    let username = '';
    let plan = '';
    let amount = 0;
    let months = 0;

    switch(data.event) {
        case 'follow':
            username = data.data.name;

            event.innerHTML = 'New Follower'
            eData.innerHTML = username

            await animate(event, eData);
            break;
        case 'subscription':
            username = data.data.username;
            plan = data.data.plan;

            event.innerHTML = `New ${plan} Subscription`;
            eData.innerHTML = username;

            await animate(event, eData);
            break;
        case 'resub':
            username = data.data.username;
            months = data.data.months;
            plan = data.data.plan;

            event.innerHTML = `${plan} Resub`;
            eData.innerHTML = `${username} for ${months} months`;

            await animate(event, eData);
            break;
        default: return;
    }
});

async function animate(event, eData) {
    event.classList.remove('opaque');
    eData.classList.remove('opaque');
    event.classList.add('anim');
    eData.classList.add('anim');

    await sleep(4000);

    event.classList.add('opaque');
    eData.classList.add('opaque');
    event.classList.remove('anim');
    eData.classList.remove('anim');
}