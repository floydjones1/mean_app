const express = require('express');
const router = express.Router();
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const uri = "mongodb+srv://root:Password123@virtualizationcluster-xn7mf.gcp.mongodb.net/test";
const passport = require('passport');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/database');


//Connect
const connection = (closure) => {
    return MongoClient.connect(uri , { useNewUrlParser: true }, (err, client) => {
        if(err) return console.log(err);

        closure(client.db('mean'));
    });
}


const sendError = (err, res) => {
    Response.status = 501;
    Response.message = typeof err == 'object' ? err.message : err;
    res.status(501).json(response);
};

let response = {
    status: 200,
    data: [],
    message: null
};

router.get('/users', (req, res) => {
    connection((db) => {
        db.collection('users')
            .find()
            .toArray()
            .then(users => {
                console.log(users);
                response.data = users;
                res.json(response);
            })
            .catch(err => {
                sendError(err, res);
            });
    });
});

router.post('/register', (req, res, next) => {
    let user = {
        name: req.body.username,
        password: req.body.password,
        email: req.body.email,
        fullname: req.body.fullname
    }

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(user.password, salt, (err, hash) => {
            if(err) throw err;
            user.password = hash;
        });
    });

    connection(db => {
        db.collection('users').insertOne(user, function(err, result){
            if(err){
                response.data = {"status": false, "msg": "Adding user failed"};
                res.json(response);
            }else{
                response.data = {"status": true, "msg": "Successfully Inserted"};
                res.json(response);
            } 

        });
    });

});

router.post('/auth', (req, res, next) => {
    let user = {
        username: req.body.name,
        password: req.body.password,
    };

    const query = { name: user.username }

    connection(db => {
        db.collection('users').findOne(query, (err, collection) => {
            if(err) throw err;
            if(collection == null){
                response.data = {status: false, msg: "No username Exist"};
                return res.json(response);
            }
            
            
            comparePasswords(user.password, collection.password, (err, isMatched) =>{
                if(err) throw err;

                if(isMatched){
                    const token = jwt.sign(collection, config.secret, {
                        expiresIn: 1800
                    });
                    response.data = {status:true,
                        token: 'JWT '+token,
                        user:{
                            id: collection._id,
                            name: collection.name,
                            email: collection.email,
                        }};
                    res.json(response);
                }else{
                    response.data = { status: false,
                        msg: "Passwords do not match"};
                    res.json(response);
                }
                
            });
        });
    });



});




//helper functions
function comparePasswords(pass, hash, callback){
    bcrypt.compare(pass, hash, (err, isMatched) =>{
        if(err) throw err;
        callback(null, isMatched);
    });
};


module.exports = router;