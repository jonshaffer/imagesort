var express = require('express'),
	nodemailer = require('nodemailer'),
	router = express.Router(),
	util = require('util');

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
	res.json('images', {});
})
.post(function(req, res, next) {
	res.json({});
});

/* GET contact page
router.get('/contact', function(req, res, next) {
	res.render('contact', new defaultPageObject('Contact', false));
});*/

/* POST contact page 
router.post('/contact', contactPost);*/

function contactPost (req, res) {
	req.assert('name', 'Name is required. Give us something to call you.').notEmpty();
	req.assert('email', 'Invalid email address.').isEmail();

	var validationErrors = req.validationErrors();

	if (validationErrors) {
		res.render('contact', { 'contact': true, title: 'Contact', errors: validationErrors, form: returnFormData(validationErrors, req.body) });
		return;
		//res.render('contact', { 'contact': true, 'complete': true, title: 'Contact' });
	}

	sendContactEmail(req);

	res.render('contact', { 'contact': true, 'complete': true, title: 'Contact' });
}

function returnFormData(validationErrors, formData) {
	var returnFormData = {
		name: formData.name,
		email: formData.email,
		company: formData.company,
		project: formData.project
	};

	for (i = 0, j = validationErrors.length; i < j; i++) {
		returnFormData[validationErrors[i].param + 'Error'] = true;
	}

	return returnFormData;
}

function sendContactEmail(req) {
	var formattedEmail = formatContactForm(req.body);
	var replyTo = formatReplyTo(req.body);

	var mailOptions = {
		from: 'NodeMailer <'+process.env.GMAIL_USERNAME+'>', // sender address
		to: 'Contact Form <'+process.env.GMAIL_USERNAME+'>', // list of receivers
		replyTo: replyTo,
		subject: 'Hello, from the website!', // Subject line
		text: formattedEmail.plainText, // plaintext body
		html: formattedEmail.html // html body
	}

	// send mail with defined transport object
	transporter.sendMail(mailOptions, function(error, info){
	    if (error) {
	        console.error(error);
	    } else {
	        console.log('A contact form sent: ' + info.response);
	    }
	});
}

function formatReplyTo(formData) {
	return formData.name+ '<'+formData.email+'>';
}

function formatContactForm(formData) {
	return {
		plainText: ''+
			'Name: '+formData.name+
			'Company: '+formData.company+
			'Email: '+formData.email+
			'Project: '+formData.project,
		html: ''+
			'<b>Name:</b>'+formData.name+'<br>'+
			'<b>Company:</b>'+formData.company+'<br>'+
			'<b>Email:</b>'+formData.email+'<br>'+
			'<b>Project:</b>'+formData.project+'<br>'
	}
}

module.exports = router;