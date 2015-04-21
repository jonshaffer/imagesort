var express = require('express'),
	nodemailer = require('nodemailer'),
	router = express.Router(),
	util = require('util'),
	pg = require('pg')
	pgConString = process.env.POSTGRESQL_STRING || 'postgresql_connection_string';

var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.GMAIL_USERNAME,
        pass: process.env.GMAIL_PASSWORD
    }
});

function defaultPageObject(routeName, showContentFooter) {
	this['production'] = (process.env.PORT) ? true : false;
	this['title'] = (routeName !== 'index') ? routeName : null;
	this[routeName.toLowerCase()] = true;
};

/* GET home page */
router.get('/', function(req, res, next) {
	res.render('index', new defaultPageObject('index'));
});

router.route('/images')
	.get(function(req, res, next) {
		var images = [];

		pg.connect(pgConString, function(err, client, done) {
			if (err) {
				return console.error('Error connecting to PostgreSQL', err);
			}

			client.query('SELECT * FROM imagesfull WHERE "Id"=1', function(err, result) {
				done();

				if(err) {
			    	return console.error('Error running Insert query', err);
			    };

			    console.log(images);
				res.json(result.rows[0].allimages);
			});
		});
	})
	.post(function(req, res, next) {
		var jsonBody = JSON.stringify(req.body);
		pg.connect(pgConString, function(err, client, done) {
			if (err) {
				return console.error('Error connecting to PostgreSQL', err);
			}

			client.query('UPDATE imagesfull SET allimages = ($1) WHERE "Id"=1', [jsonBody], function(err, result) {
				done();

				if(err) {
			    	return console.error('Error running Insert query', err);
			    };

			    console.log(jsonBody);
				res.json(req.body);
			});
		});
	});

module.exports = router;