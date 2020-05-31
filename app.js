const express = require('express');
const app = express();
const path = require('path');
const port = 3000;
const bodyParser = require('body-parser');
const session = require('express-session');

app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: true,
    saveUninitialized: true
}));

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("views", "./");


const registeredUser = [
    {
        username: "admin",
        email: "admin@gmail.com",
        password: "admin"
    }
];

const auth = (req, res, next) => {
    let emails = registeredUser.map(ru => ru.email);
    if (req.session && emails.includes(req.session.email)){
        return next();
    }
    else
      return res.sendStatus(401);
  };

let days = {
        "7-5-2020": {
            events: [
                {
                    title: "Running",
                    startTime: "11:20",
                    endTime: "12:20",
                    isFixed: true,
                    participantsEmails: ['admin@gmail.com'],
                    participants: 1,
                    period: 'Day',
                    location: "Asenovgrad, Stadion Shipka",
                    additionalInfo: ""
                },
                {
                    title: "Running",
                    startTime: "11:20",
                    endTime: "12:20",
                    participantsEmails: ['admin@gmail.com'],
                    participants: 1,
                    period: '',
                    location: "Asenovgrad, Stadion Shipka",
                    additionalInfo: ""
                }
            ]
        }
    };

app.use(function(req, res, next) {
    res.locals.session = req.session;
    next();
});

app.get('/generated-options', (req, res, next) => {
    res.render(path.join(__dirname, 'generated-options.ejs'));
});

app.get('/friends', (req, res, next) => {
    res.render(path.join(__dirname, 'friends.ejs'));
});

app.get('/friends-request', (req, res, next) => {
    res.render(path.join(__dirname, 'friends_requests.ejs'));
});

app.get('/event-request', (req, res, next) => {
    res.render(path.join(__dirname, 'event_requests.ejs'));
});

app.get('/login', (req, res, next) => {
    res.render(path.join(__dirname, 'login.ejs'));
});

app.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = registeredUser.find(ru => ru.email == email && ru.password == password);
    if(user){
        req.session.email = user.email;
        req.session.username = user.username;
        res.redirect('/');
    }else{
        res.redirect('/login');
    }
});

app.get('/logout', (req, res, next) => {
    req.session.destroy();
    res.render(path.join(__dirname, 'login.ejs'));
  });

app.get('/register', (req, res, next) => {
    res.render(path.join(__dirname, 'register.ejs'));
});

app.post('/register', (req, res, next) => {
    const newUser = req.body;
    registeredUser.push(newUser);
    res.redirect('/login');
});

app.use('/:year/:month/:day/', express.static(__dirname + '/'));

app.get('/:year/:month/:day/events', (req, res, next) => {
    if(!days[`${req.params.day}-${req.params.month}-${req.params.year}`]){
        days[`${req.params.day}-${req.params.month}-${req.params.year}`] = {};
        days[`${req.params.day}-${req.params.month}-${req.params.year}`]['events'] = [];
    }
    res.render(path.join(__dirname, 'events.ejs'), {
        year: req.params.year,
        month: req.params.month,
        day: req.params.day,
        url: `/${req.params.year}/${req.params.month}/${req.params.day}`,
        events: days[`${req.params.day}-${req.params.month}-${req.params.year}`].events
    });
});

app.get('/', (req, res, next) => {
    if(req.session['email']){
        res.render(path.join(__dirname, 'home_page.ejs'))
    }else {
        res.redirect('/unregistered');
    }
});

app.get('/:year/:month/:day/addEvent', (req, res, next) => {
    res.render(path.join(__dirname, 'add-event.ejs'), {
        link: `/${req.params.year}/${req.params.month}/${req.params.day}/addEvent`
    });
});

app.get('/unregistered', (req, res, next) => {
    let dateTime = new Date();
    dateTime = dateTime.toISOString().slice(0,10);
    dateTime = dateTime.split('-');
    res.redirect(`/${dateTime[0]}/${dateTime[1]}/${dateTime[2]}/events`);
})

app.post('/:year/:month/:day/addEvent', (req, res, next) => {
    const key = `${req.params.day}-${req.params.month}-${req.params.year}`;
    const newEvent = req.body;
    newEvent['participantsEmails'] = [];
    newEvent['participantsEmails'].push('admin@gmail.com');
    days[key]['events'].push(newEvent);
    res.redirect(`/${req.params.year}/${req.params.month}/${req.params.day}/events`);
});

app.get('/:year/:month/:day/schedule', (req, res, next) => {
    const key = `${req.params.day}-${req.params.month}-${req.params.year}`;
    let neededTime = 24;
    for(const event of days[key]['events']){
        neededTime -= parseInt(event.endTime) - parseInt(event.startTime);
    }
    let options = [neededTime, neededTime + 1.30, neededTime + 2];
    res.render(path.join(__dirname, 'generated-options.ejs'), {
        options: options
    });
});

app.use('/:year/:month/:day/:eventTitle', express.static(__dirname + '/'));

app.get('/:year/:month/:day/:eventTitle/editEvent', (req, res, next) => {
    const key = `${req.params.day}-${req.params.month}-${req.params.year}`;
    const event = days[key]['events'].find((x) => x.title == req.params.eventTitle);
    res.render(path.join(__dirname, 'edit-event.ejs'), {
        link: `/${req.params.year}/${req.params.month}/${req.params.day}/${req.params.eventTitle}/editEvent`,
        event: event
    });
});

app.post('/:year/:month/:day/:eventTitle/editEvent', (req, res, next) => {
    const key = `${req.params.day}-${req.params.month}-${req.params.year}`;
    for(let i in days[key]['events']) {
        if(days[key]['events'][i].title == req.params.eventTitle){
            Object.assign(days[key]['events'][i], req.body);
        }
    }
    res.redirect(`/${req.params.year}/${req.params.month}/${req.params.day}/events`);
});

app.get('/:year/:month/:day/:eventTitle/deleteEvent', (req, res, next) => {
    const key = `${req.params.day}-${req.params.month}-${req.params.year}`;
    for(let i in days[key]['events']) {
        if(days[key]['events'][i].title == req.params.eventTitle){
            days[key]['events'].splice(i, 1);
        }
    }
    res.redirect(`/${req.params.year}/${req.params.month}/${req.params.day}/events`);
});



app.listen(port, () => console.log(`Example app listening at http://localhost:${port}`))