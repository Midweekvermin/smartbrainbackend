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
const knex = require('knex');
const db = knex({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'postgres',
    password: '',
    database: 'smartbrain'
  }
});

db.raw('SELECT 1')
  .then(() => {
    console.log('Database connection successful');
  })
  .catch(error => {
    console.error('Error connecting to the database:', error);
  });

const httpsOptions = {
  cert: fs.readFileSync('www.midweekvermin.com.crt'),
  key: fs.readFileSync('www.midweekvermin.com.pem'),
  ca: fs.readFileSync('www.midweekvermin.com.ca')
};

const app = express();

app.use(cors());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

app.use((req, res, next) => {
  if (req.protocol === 'http') {
    res.redirect(301, `https://${req.headers.host}${req.url}`);
  } else {
    // Add the following line to enforce HTTPS for all routes
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    next();
  }
});
const httpServer = http.createServer(app);
httpServer.listen(httpPort, () => {
  console.log(`HTTP server running on port ${httpPort}`);
});

// Handle HTTPS requests
const httpsServer = https.createServer(httpsOptions, app);
httpsServer.listen(httpsPort, () => {
  console.log(`HTTPS server running on port ${httpsPort}`);
});
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
})

app.post('/signin', (req, res) => {
  const { email, password } = req.body;

  db.select('email', 'hash')
    .from('login')
    .where({ email })
    .then(data => {
      const isValid = bcrypt.compareSync(password, data[0]?.hash);

      if (!isValid) {
        return res.status(400).json('Wrong username or password');
      }

      return db.select('*')
        .from('user')
        .where({ email })
        .then(users => res.json(users[0]))
        .catch(err => {
          console.error(err);
          res.status(400).json('Unable to retrieve user');
        });
    })
    .catch(err => {
      console.error(err);
      res.status(400).json('Invalid login attempt');
    });
});


app.post('/register', (req, res) => {
    const { email, name, password } = req.body;
    const hash = bcrypt.hashSync(password);
  
    db.transaction((trx) => {
      trx.insert({
        email: email,
        hash: hash, // Pass the hashed password as a string
      })
        .into('login')
        .returning('email')
        .then((loginEmail) => {
          return trx('user')
            .returning('*')
            .insert({
              email: loginEmail[0].email,
              name: name,
              joined: new Date(),
            })
            .then((user) => {
              res.json(user[0]);
            });
        })
        .then(trx.commit)
        .catch(trx.rollback);
    })
      .catch((err) => console.log(err));
  });

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


