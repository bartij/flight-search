const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3000;
const router = require('./api/router');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
router(app);

app.use(express.static('public/images'));
app.use(express.static('public/css'));
app.use(express.static('public/scripts'));

app.get('/', (req, res) => res.sendFile(path.resolve('client/', 'index.html')));

app.listen(port, function(error) {
    if (error) throw error;
    console.log('Express server listening on port', port);
});

module.exports = app;