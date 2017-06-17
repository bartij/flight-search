const express = require('express');
const path = require('path');

const controller = require('./controller');


module.exports = (app) => {
    const apiRoutes = express.Router();

    app.use('/', apiRoutes);
    apiRoutes.get('/airlines', controller.airlines);
    apiRoutes.get('/airports/:city', controller.airports);
    apiRoutes.post('/search', controller.search);
};
