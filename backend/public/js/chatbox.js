const ws = new WebSocket('ws://localhost:2020');
const chatbox = document.getElementsByClassName('chatbox')[0];

ws.addEventListener('open', (_) => {
    ws.send('chatbox');
});

ws.addEventListener('message', (msg) => {
    const data = JSON.parse(msg.data);
    switch(data.event) {
        case 'message':

            const div = document.createElement('div');
            div.classList.add('chat');
            div.id = data.message.id;

            const images = document.createElement('span');

            data.badges.forEach(url => {
                let img = document.createElement('img');
                img.src = url
                img.style.paddingRight = '2px';
                img.height = 16
                img.width = 16;
                images.appendChild(img);
            });

            const user = document.createElement('span');
            user.style.color = data.color;
            user.innerText = data.username;

            const chatMsg = document.createElement('span');
            chatMsg.classList.add('message');
            chatMsg.innerHTML = `: ${data.message.content}`;

            div.append(images, user, chatMsg);

            chatbox.appendChild(div);
            break;
        case 'delete':
            const message = document.getElementById(data.id);
            message.remove();
            break;
    }
});

window.onbeforeunload(_ => {
    ws.send('chatbox_close');
});