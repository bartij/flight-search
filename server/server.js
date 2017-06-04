const express = require('express');
const bodyParser = reuire('body-parser');
const app = express();
const port = 3000;
const router = require('./api/router');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
router(app);

app.use('/', function (req, res) {
    res.sendFile(path.resolve('client/index.html'));
});

app.listen(port, function(error) {
    if (error) throw error;
    console.log("Express server listening on port", port);
});