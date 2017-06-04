const http = require('http');

exports.airlines = function(req, res) {
    console.log('airlines', req);
    res.send("Hello airlines");
};
exports.airports = function(req, res) {
    console.log('airports:', req);
    res.send("Hello airports");
};
exports.search = function(req, res) {
    console.log('search:', req.params);
    res.status(200).json(req.params);
};