const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: true }));


const registeredUser = [
    {
        email: "admin@gmail.com",
        password: "admin"
    }
];

const days = [
    {
        day: '',
        month: '',
        events:{
        }
    }
];

app.get('/generated-options', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'generated-options.html'));
});

app.get('/login', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'login.html'));
});

app.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    if(registeredUser.find(ru => ru.email == email && ru.password == password)){
        res.redirect('/');
    }else{
        res.redirect('/login');
    }
});

app.get('/register', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/register', (req, res, next) => {
    const newUser = req.body;
    registeredUser.push(newUser);
    res.redirect('/login');
});

app.get('/:month/:week/:day/events', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'events.html'));
});

app.get('/', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'home_page.html'))
});

app.get('/addEvent', (req, res, next) => {
    res.sendFile(path.join(__dirname, 'add-event.html'))
});

app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))