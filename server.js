const bodyParser = require('body-parser');
const express = require('express');
const path = require('path');
const app = express();

const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use('/dashboard.js', express.static(path.join(__dirname, 'dashboard.js')));

//crypto
var BigInteger = require('bigi') //npm install --save bigi@1.4.2
var ecurve = require('ecurve') //npm install --save ecurve@1.0.0
const bcrypt = require('bcrypt');
var crypto = require('crypto');

//database
const levelup = require('levelup');
const rocksdb = require('rocksdb');
const db = levelup(rocksdb('./mydb'));

//authentication & session handling
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

app.use(session({secret: 'SecretSessionCookieSigningKey',
				resave: false,
				saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

//checks credentials against db
//creates a session with the username if valid
passport.use(new LocalStrategy(
	async (username, password, done) => {
		try{
			if (await validUser(username, password))
				return done(null, {username: username});
			else
				return done(null, false, {message: 'Invalid credentials.'});
		}catch(err){
			return done(err);
		}
	}
));
//passport function that saves username to session
passport.serializeUser((user, done) => {
	done(null, user.username);
});
//passport function to retrieve full user object
passport.deserializeUser(async (username, done) => {
	let fullUser = await getUser(username);
	fullUser.username = username;
	console.log("Deserialized User:", fullUser);
	done(null, fullUser);
});

function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated())
		return next();
	else
		res.redirect('/login');
}

function noVotingRights(req, res, next) {
	if (!req.user.votingRights)
		next()
	else
		res.status(403).send('Permission denied.');
}

function noKeystore(req, res, next) {
	if (!req.user.keystore)
		next()
	else
		res.status(403).send('Permission denied.');
}

async function initDB() {
    await db.open();
}

async function storeUser(username, password) {
    const hashedPassword = await bcrypt.hash(password, 10);
	const user = {
		password: hashedPassword,
		"keystore": null,
		votingRights: false
	};
    await db.put(username, JSON.stringify(user));
}

async function getUser(username) {
    const userString = await db.get(username);
	return JSON.parse(userString);
}

async function validUser(username, password) {
	try {
		const user = await getUser(username);
		console.log("user: " + JSON.stringify(user));
		
		const isValid = await bcrypt.compare(password, user.password);
		console.log('Is Valid:', isValid);
		return isValid;
	} catch (err) {
		if (err.notFound) {
			return false;
		}
		throw err;
	}
}

async function giveVotingRights(username) {
    try {
        // 1. Fetch the user data by its key
        const user = await getUser(username);

        // 2. Update the votingRights property
        user.votingRights = true;

        // 3. Store the updated user data back into the database
        await db.put(username, JSON.stringify(user));

        console.log(`Updated votingRights for ${username}`);
    } catch (error) {
        console.error(`Error updating votingRights for ${username}:`, error);
    }
}

async function storeEncryptedWallet(username, keystore) {
    try {
        const user = await getUser(username);
        user.keystore = keystore;
        await db.put(username, JSON.stringify(user));

        console.log(`Updated keystore for ${username}`);
    } catch (error) {
        console.error(`Error updating keystore for ${username}:`, error);
    }
}


//Immediately Invoked Function Expression to setup the database before server starts
(async () => {
	await initDB();
	await storeUser('alice', '123123');
	await storeUser('bob', 'pass');
})();

app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, '/index.html'));
});

app.get('/login', (req, res) => {
	res.sendFile(path.join(__dirname, '/login.html'));
	
});

app.post('/login', 
passport.authenticate('local', {failureRedirect: '/login' }),
async (req, res) => {
    try {
        // Fetch the full user object
        const fullUser = await getUser(req.user.username);
        
        // Attach the full user object to req.user
        req.user = fullUser;
        
        console.log("login route handler: req.user: " + JSON.stringify(req.user));

        // Redirect based on voting rights
        if (req.user.votingRights) {
            res.redirect('/dashboard');
        } else {
            res.redirect('/setup');
        }
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Internal Server Error');
    }
});


function random(bytes){
	do {
			var k = BigInteger.fromByteArrayUnsigned(crypto.randomBytes(bytes));
	} while (k.toString() == "0" && k.gcd(n).toString() != "1")
	return k;
}

function multiply(inp,k){
	var str = inp.multiply(k).toString().replace("(","").replace(")","");
	var arr = str.split(",").map(val => String(val));
	arr [0] = BigInteger.fromBuffer(arr[0]);
	arr [1] = BigInteger.fromBuffer(arr[1]);

	return ecurve.Point.fromAffine(ecparams,arr[0],arr[1]);
}

function toHex(inp){
	return BigInteger.fromBuffer(inp.toString(),"hex").toHex();
}

const privateKey = Buffer.from("195200c929c2068dc470c99132d8958f1d48b408788b3f37ca11c660578c9c89", 'hex');
							  
var ecparams = ecurve.getCurveByName('secp256k1'); 
var P = ecparams.G.multiply(BigInteger.fromBuffer(privateKey));
var x = P.affineX.toBuffer(32);
var y = P.affineY.toBuffer(32);

var G = ecparams.G;
var n = ecparams.n;

console.log("Px: " + '0x' + toHex(P.affineX))
console.log("Py: " + "0x" + toHex(P.affineY))


app.get('/setup', ensureAuthenticated, noVotingRights, (req,res) => {
		res.sendFile(path.join(__dirname, '/setup.html'));
});
	

/* STEP 1 - SERVER
The signer randomly selects an integer k ∈ Zn
, calculates R = kG, and then transmits R to the
requester
*/
app.get('/setup/generate-random-integer', ensureAuthenticated, noVotingRights, (req, res) => {
	const k = random(32);
	req.session.k = k.toString();
	const R = multiply(G, k);
	res.json({"R": {"x": R.affineX.toString(), "y": R.affineY.toString()}, 
		"P": {"x": P.affineX.toString(), "y": P.affineY.toString()}});
});

/* STEP 3 - SERVER
The signer calculates the blind signature s’ = k − c’d, and then sends it to the requester.
*/
app.post('/setup/sign', ensureAuthenticated, noVotingRights, async (req, res) => {
    try {
        //3.1 - Sign blinded address
		const addressBlind = BigInteger.fromBuffer(req.body.addressBlind);
        
		const k = BigInteger.fromBuffer(req.session.k);
        if (!k) 
			return res.status(400).send("k not found.");
        
        const sBlind = k.subtract(addressBlind.multiply(BigInteger.fromBuffer(privateKey)));
        
        delete req.session.k;
        //3.2. Update votingRights field in db to true
		await giveVotingRights(req.user.username);
        
        //3.3 Send signature
        res.json({"sBlind": sBlind.toString()});

    } catch (error) {
        console.error('Error during the signing process:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/setup/store-encrypted-wallet', ensureAuthenticated, noKeystore,
async (req, res) => {
	try{
		const keystore = JSON.parse(req.body.keystore);
		await storeEncryptedWallet(req.user.username, keystore);
	} catch (error) {
		console.error('Error saving keystore to database:', error);
        res.status(500).send('Internal Server Error: Failed to save key');
	}
});

app.get('/get-keystore', ensureAuthenticated, (req, res) => {
    if(req.user && req.user.keystore) {
		console.log("req.user.keystore: " + JSON.stringify(req.user.keystore))
        res.json({ keystore: req.user.keystore });
    } else {
        res.status(400).send('Keystore not found.');
    }
});


app.get('/dashboard', ensureAuthenticated, (req, res) => {
	res.sendFile(path.join(__dirname, '/dashboard.html'));
});


app.get('/logout', (req, res) =>{	
	req.logout(req.user, err => {
		if(err) 
			return next(err);
		res.redirect("/login");
	});
});
