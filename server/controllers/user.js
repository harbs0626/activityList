let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

let passport = require('passport');
let jwt = require('jsonwebtoken');
let database = require('../config/db');

let userModel = require('../models/user');
let User = userModel.User;

module.exports.processLogin = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err){
            console.log("[Error Summary] - Unable to process request");
            console.log(`- ${err}`);
            return res.json({ success: false, msg: `${err}` });
        } else {
            if (!user) {
                console.log("- Authentication error!");
                return res.json({ success: false, msg: "- Authentication error!" });
            } else {
                req.login(user, (err) => {
                    if (err){
                        return next(err);
                    }

                    const payLoad = {
                        id: user._id,
                        // displayName: user.displayName,
                        // username: user.username,
                        email: user.email
                    };

                    const authToken = jwt.sign(payLoad, database.Secret, {
                        expiresIn: 604800 // 1 week
                    });

                    return res.json({ success: true, msg: 'User successfully logged in!', user: {
                        id: user._id,
                        displayName: user.displayName,
                        username: user.username,
                        email: user.email }, 
                    token: authToken });
                });
            }
        }
    })(req, res, next);
}

module.exports.processRegister = (req, res, next) => {
    let newUser = new userModel.User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        address: req.body.address,
        contactNumber: req.body.contactNumber,
        province: req.body.province,
        country: req.body.country,
        postalCode: req.body.postalCode,
        username: req.body.username,
        emailAddress: req.body.emailAddress
    });

    User.register(newUser, req.body.password, (err) => {
        if (err) {
            console.log("[Error Summary] - Unable to register new user:");
            if (err.name == "UserExistsError") {
                console.log("- User already exists!");
                return res.json({ success: false, msg: 'User already exists!'});
            } else {
                console.log(`- ${err}`);
                return res.json({ success: false, msg: `${err}`});
            }
        } else {
            return res.json({ success: true, msg: 'User registered successfully!'});
        }
    })
};

module.exports.processLogout = (req, res, next) => {
    req.logout();
    res.json({ success: true, msg: 'User successfully logged out!' });
};
