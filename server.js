const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const hostname = 'www.midweekvermin.com';
const httpPort = 80;
const httpsPort = 443;
const bcrypt = require('bcrypt-nodejs');
const cors = require('cors');
const path = require('path');
const knex = require('knex')
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user:'postgres',
        password: '',
        database: 'smartbrain'
    }
});

const httpsOptions = {
    cert: fs.readFileSync('www.midweekvermin.com.crt'),
    key: fs.readFileSync('www.midweekvermin.com.pem'),
    ca: fs.readFileSync('www.midweekvermin.com.ca')
  

};

db.select('*').from('user');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'build')));
const httpServer = http.createServer(app);
const httpsServer = https.createServer(httpsOptions, app);

app.use((req, res, next) => {
    if(req.protocol === 'http') {
        res.redirect(301, `https://${req.headers.host}${req.url}`);
    } else {
    next();  
    }
})



app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.post('/signin', (req,res) => {
  db.select('email', 'hash').from('login')
  .where('email', '=', req.body.email)
  .then(data => {
const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
if(isValid){
   return db.select('*').from('user')
    .where('email', '=', req.body.email)
    .then(user => {
        res.json(user[0])
    })
    .catch(err => res.status(400).json('Invalid'))
}
res.status(400).json('wrong username or password')
  })
  .catch(err => res.status(400).json('invalid'))
})

app.post('/register', (req,res) => {
    const {email, name, password} = req.body;
    const hash = bcrypt.hashSync(password);
db.transaction(trx =>{
    trx.insert({
        hash: hash,
        email: email
    })
    .into('login')
    .returning('email')
    .then(loginEmail =>{
        return trx('user').returning('*').insert({
            email: loginEmail[0],
        name: name,
        joined: new Date()
        })
        .then(response => {
            res.json(response);
        })
          .then(user=> {
            res.json(user[0])
          })
    })
    .then(trx.commit)
    .catch(trx.rollback)
})

  .catch(err => res.status(400).json('invalid'))
})

app.get('/profile/:id', (req,res) => {
    const {id} = req.params;
    let found = false;
   db.select('*').from('user').where({id: id}).then(user => {
  res.json(user[0])
   })
    if (!found) {
        res.status(404).json('invalid');
    }
})

app.put('/image', (req,res) =>{
    const {id} = req.body;
    db('user').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(entries => {
        res.json(entries[0].entries);
    })
    .catch(err => res.status(400).json('unable to get entries'))
})


httpServer.listen(httpPort);
httpsServer.listen(httpsPort);