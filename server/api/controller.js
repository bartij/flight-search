const request = require('request-promise');

const requestError = (status, content) => {
    const successCode = 200;
    if (status !== successCode) {
        return new Error('Request Failed.\n' + `Status Code: ${status}`);
    } else if (!/^application\/json/.test(content)) {
        return new Error('Invalid content-type.\n' + `Expected application/json but received ${content}`);
    } else {
        return null;
    }
};
// const getAirLinesData = (host, path, res) => {
//     http.get({
//         hostname: host,
//         port: 80,
//         path: path,
//         agent: false
//     }, (response) => {
//         const { statusCode } = response;
//         const contentType = response.headers['content-type'];
//         const error = requestError(statusCode, contentType);
//         if (error) {
//             console.error(error.message);
//             response.resume();
//             return;
//         }
//
//         response.setEncoding('utf8');
//         let rawData = '';
//         response.on('data', (chunk) => {
//             rawData += chunk;
//         });
//         response.on('end', () => {
//             try {
//                 const parsedData = JSON.parse(rawData);
//                 res.send(parsedData);
//             } catch (e) {
//                 console.error(e.message);
//             }
//         });
//     }).on('error', (e) => {
//         console.error(`Got error: ${e.message}`);
//         return {
//             statusCode: 500,
//             statusMessage: e.message
//         };
//     });
// };

const getAirLinesData = (uri, res) => {
    request({
        uri: uri,
        headers: {
            'User-Agent': 'Request-Promise'
        },
        json: true
    }).then((response) => {
        try {
            res.send(response);
        } catch (e) {
            console.error(e.message);
        }
    }).catch((e) => {
        console.error(`Got error: ${e.message}`);
    });
};

exports.airlines = function(req, res) {
    getAirLinesData('http://node.locomote.com/code-task/airlines', res);
};
exports.airports = function(req, res) {
    const city = req.params.city;
    getAirLinesData('http://node.locomote.com/code-task/airports?q=' + city, res);
};
exports.search = function(req, res) {
    const { from, to, date } = req.params;
    getAirLinesData('http://node.locomote.com/code-task/flight_search/QF?date=2018-09-02&from=SYD&to=JFK', res);
};