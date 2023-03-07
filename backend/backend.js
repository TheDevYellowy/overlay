const express = require('express');
const app = express();

const path = require('node:path');

app.use(express.static(path.join(__dirname, 'public')));
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.set('views', path.join(__dirname, 'views'));

app.get('/chatbox', (req, res) => {
    res.render('chatbox.ejs');
});

app.listen(80, () => console.log('listening'));