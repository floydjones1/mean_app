const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const http = require('http');
const app = express();
const config = require('./server/config/database');
const mongoose = require('mongoose');

mongoose.connect(config.database);

mongoose.connection.on('connected', () => {
    console.log(`Connected to database mongoose`);
});

mongoose.connection.on('error', (err) => {
    console.log(`Database error: ${err}`);
});

const api = require('./server/routes/api');
const users = require('./server/routes/users');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));


app.use(express.static(path.join(__dirname, 'dist/mean')));

app.use('/users', users);
app.use('/api', api);


app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/mean/index.html'));
});

const port = 80;
app.set('port', port);

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server is running on :${port}`);
})
