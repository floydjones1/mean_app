const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');


//User schema
const UserSchema = mongoose.Schema({
    name: {
        type: String
    },
    email
});