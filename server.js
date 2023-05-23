// initial skeleton for skeleton for server
const express = require('express');
const bcrypt = require('bcrypt-nodejs');

const app = express();
app.use(express.urlencoded({extended: false}));
app.use(express.json());

const database ={
    users: [
        {
            id: '123',
            name: 'John',
            email: 'john@gmail.com',
            password: 'cookies',
            entries: 0,
            joined: new Date()
        },
        {
            id: '124',
            name: 'Sally',
            email: 'sally@gmail.com',
            password: 'bananas',
            entries: 0,
            joined: new Date()
        }
    ]
}

app.get('/', (req, res) => {
    res.send('this is working')
})

app.post('/signin', (req,res) => {
    bcrypt.compare(password, hash, function(err, hash) {

    });
    if(req.body.email === database.users[0].email &&
         req.body.password === database.users[0].password){
    res.json('signing in')
         } else {
            res.status(400).json('incorrect login')
         }
})

app.post('/register', (req,res) => {
    const {email, name, password} = rew.body;
    bcrypt.compare( password, hash, function(err, hash) {
        console.log(hash);
    });
database.users.push({
id:'125',
name: name,
email: email,
password: password,
entries: 0,
joined: new Date()
    })
    res.json(database.users[database.users.length-1]);
})

app.get('/profile/:id', (req,res) => {
    const {id} = req.params;
    let found = false;
    database.users.forEach(users => {
        if (users.id === id) {
            found = true;
           return res.json(users);
        } 
    })
    if (!found) {
        res.status(404).json('invalid');
    }
})

app.put('/image', (req,res) =>{
    const {id} = req.body;
    let found = false;
    database.users.forEach(users => {
        if (users.id === id) {
            found=true;
            users.entries++
           return res.json(users.entries);
        } 
    })
    if (!found) {
        res.status(404).json('invalid');
    }
})

bcrypt.compare("bacon", hash, function(err, hash) {

});
bcrypt.compare("veggies", hash, function(err, res) {

});

app.listen(3000, () => {
    console.log('app is running on port 3000')
})