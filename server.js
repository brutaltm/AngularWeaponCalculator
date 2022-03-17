const PORT = process.env.PORT || 8080;
const sqlite3 = require('sqlite3').verbose();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const { GoogleAuth, OAuth2Client } = require('google-auth-library');

app.use(cors(
	{
		origin: "*", 
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		preflightContinue: true,
		credentials: true
	}
));

const router = express.Router();
app.use('/api', router);
/* Static serving */
app.use(express.static(__dirname + '/rust-weapon-damage/dist/rust-weapon-damage'));
app.get(/^((?!\/api\/).)*$/, function(req,res) {
  console.log("MATCH");
  res.sendFile(__dirname+'/rust-weapon-damage/dist/rust-weapon-damage/index.html');
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const session = require('express-session');
app.use(session(
	{
		secret: 'ssshhhhh',
		saveUninitialized: true, 
		cookie: { 
			maxAge: 1000 * 60 * 60 * 24, 
		}, 
		resave: true
	}
));

let db = new sqlite3.Database('./rustGuns.db', (err) => {
	if (err) 
		console.error(err.message);
	else {
    console.log('Connected to the rustGuns database.');
    db.get("SELECT * FROM guns",(err,row) => {
      if (err) {
        const createGunsString = 
        'CREATE TABLE guns (' +
          'id INTEGER PRIMARY KEY,' +
          'name TEXT NOT NULL UNIQUE,' + 
          'firerate REAL NOT NULL,' +
          'dmg REAL NOT NULL,' +
          'minRange INTEGER,' +
          'maxRange INTEGER' +
        ');';
        db.run(createGunsString,(err) => {
          if (err) console.log(err);
          const insertGunsString = `INSERT INTO guns
            (name,firerate,dmg,minRange,maxRange) VALUES
            ( "SAR", 174.93, 40, 20, 100 ),
            ( "Python", 150, 55, 8, 48 ),
            ( "Thompson", 129.87, 37.5, 10, 60 ),
            ( "Custom SMG", 100, 30, 7, 42 ),
            ( "M39", 200, 50, 30, 150 ),
            ( "MP5", 100, 35, 10, 60 ),
            ( "AK", 133.33, 50, 20, 100 );`
          db.run(insertGunsString, (err) => { if (err) console.log(err) });
        });
      }
    });
  }
});

const googleClient = new OAuth2Client( { 
  clientId: process.env["CLIENT_ID"],
  clientSecret: process.env["CLIENT_SECRET"]
});

app.listen(PORT, function() { console.log('nasluchujemy na '+PORT); });

app.get('/api/guns', (req, resp) => {
	db.all(`SELECT * FROM guns`,(err,rows) => {
		if(err) {
			resp.json([]);
		} else {
			console.log("Served guns");
			resp.json(rows);
		}
	});
	//resp.end();
});

// app.get('/api/user', (req, resp) => {
// 	db.all('SELECT * FROM users', (err,rows) => {
// 		console.log("Served users");
// 		resp.send(rows[0]);
// 	});
// });

app.post('/api/verifyToken',(req, res) => {
  //verify the token using google client
  googleClient
    .verifyIdToken({
      idToken: req.body.token,
      audience: process.env["CLIENT_ID"]
    })
    .then(login => {
      //if verification is ok, google returns a jwt
      var payload = login.getPayload();
      var userid = payload['sub'];
      // console.log("Payload: ",payload);
      // console.log("UserID: ",userid);

      //check if the jwt is issued for our client
      var audience = payload.aud;
      if (audience !== googleClient._clientId) {
        throw new Error(
          'error while authenticating google user: audience mismatch: wanted [' +
            config.google.clientID +
            '] but was [' +
            audience +
            ']'
        );
      }
      req.session.idToken = req.body.token;
      //promise the creation of a user
      res.json({
        id: payload['sub'], //google id
        name: payload['name'], //profile name
        photoUrl: payload['picture'], //profile pic
        email: payload['email'],
        firstName: payload.given_name,
        lastName: payload.family_name
      });
    });
});

app.get('/api/verifyIfLoggedIn',(req, res) => {
  //verify the token using google client
  if (!req.session.idToken) {
    console.log("Brak idTokena w sesji. ");
    return;
  }
  googleClient
    .verifyIdToken({
      idToken: req.session.idToken,
      audience: process.env["CLIENT_ID"]
    })
    .then(login => {
      //if verification is ok, google returns a jwt
      var payload = login.getPayload();
      var userid = payload['sub'];
      // console.log("Payload: ",payload);
      // console.log("UserID: ",userid);

      //check if the jwt is issued for our client
      var audience = payload.aud;
      if (audience !== googleClient._clientId) {
        throw new Error(
          'error while authenticating google user: audience mismatch: wanted [' +
            config.google.clientID +
            '] but was [' +
            audience +
            ']'
        );
      }
      //promise the creation of a user
      res.json({
        id: payload['sub'], //google id
        name: payload['name'], //profile name
        photoUrl: payload['picture'], //profile pic
        email: payload['email'],
        firstName: payload.given_name,
        lastName: payload.family_name
      });
    });
});

app.get('/api/logout', (req, resp) => {
  req.session.idToken = null;
  resp.json({message: "OK"});
});
