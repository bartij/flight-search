const express = require('express');
const controller = require('./controller');

module.exports = function(app) {
    const apiRoutes = express.Router();

    app.use('/', apiRoutes);
    apiRoutes.get('/airlines', controller.airlines);
    apiRoutes.get('/airports/:city', controller.airports);
    apiRoutes.post('/search', controller.search); //:from-:to-:date
};