const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer =require('nodemailer');
require('dotenv').config();

// Import user method from the database
const User = require("./../models/User");

//Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', // SMTP server
    port: 587,                    // or 465 for SSL
    secure: false,
    auth:{
        user : process.env.MY_EMAIL,
        pass : process.env.EMAIL_PASS
    }
});
 //Generate Token
 const generateToken = (email) =>{
    return jwt.sign({ email }, process.env.JWT_SECRET, {expiresIn: '1h'});
 };

 // Send verification email
const sendVerificationEmail = async (userEmail, token) => {
    const url = `http://localhost:3000/user/verify/${token}`; // Update the URL based on your app's domain

    const mailOptions = {
        from: process.env.MY_EMAIL,
        to: userEmail,
        subject: 'Email Verification',
        html: `
            <h2>Email Verification</h2>
            <p>Please click the link below to verify your email:</p>
            <a href="${url}">${url}</a>
            <p>This link will expire in 1 hour.</p>
            <p>Please Do not reply this email.This is auto system generated email </p>
        `
    };

    await transporter.sendMail(mailOptions);
};


router.get('/', (req, res) => {
    res.render('login')
});

router.get("/signup", (req, res) => {
    res.render("signup")
})

//signup routes
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const registeredUser = await User.findOne({ name, email })//user is already registered or not
        if (!registeredUser) {
            const hashedpassword = await bcrypt.hash(password, 10);
            const userdata = new User({
                name,
                email,
                password: hashedpassword,
                isVerified: false
            });
            await userdata.save();

            //Generate token for email verification
            const token = generateToken(email);

            //send verification email
            await sendVerificationEmail(email, token);

            console.log(userdata);
            res.status(200).render('thank-you');
        } else {
            res.status(400).json({ message: 'User already registered' });

        }

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: err })
    }
});
//verify route

// Verify Route
router.get('/verify/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;

        // Find the user by email and update isVerified status
        const user = await User.findOneAndUpdate(
            { email },
            { isVerified: true },
            { new: true }
        );

        if (!user) {
            return res.status(400).send('User not found.');
        }

        res.status(200).render("email")
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).send('Verification token has expired.');
        } else {
            return res.status(400).send('Invalid or expired token.');
        }
    }
});

router.post('/login', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Find the user by name or email only (do not check password here)
        const userdata = await User.findOne({ 
            name, 
            email 
        });

        if (!userdata) {
            return res.status(400).send('User not found');
        }
        //check if the user's email is verified
        if (!userdata.isVerified) {
            return res.status(400).send('Please verify your email before logging in.');
        }
        // Check if the entered password matches the hashed password in the DB
        const isMatch = await bcrypt.compare(password, userdata.password);

        if (!isMatch) {
            return res.status(400).send('Invalid credentials');
        }

        console.log(userdata);

        // User authenticated, render the home page or send a success response
        // res.status(200).json(userdata)
        res.render("home");
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;