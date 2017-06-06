const request = require('request-promise');
const moment = require('moment');

const getApiData = (uri) => request({
    uri: uri,
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true
});

const datesArray = (middleDate) =>
    [moment(middleDate).add(-2, 'd'), moment(middleDate).add(-1, 'd'), moment(middleDate),
        moment(middleDate).add(1, 'd'), moment(middleDate).add(2, 'd')];

const dateString = (date) => moment(date).format('YYYY-MM-DD');

const createFlightSearchUrl = (airlineCode, date, from, to) =>
    'http://node.locomote.com/code-task/flight_search/' + airlineCode + '?date=' + date + '&from=' + from + '&to=' + to;
const airlinesUrl = 'http://node.locomote.com/code-task/airlines';
const airportsUrl = 'http://node.locomote.com/code-task/airports?q=';
const searchUrl = createFlightSearchUrl('QF','2018-09-02','SYD','JFK');

exports.airlines = function(req, res) {
    getApiData(airlinesUrl)
        .then((airlines) => {
            try {
                res.send(airlines);
            } catch (e) {
                console.error(e.message);
            }
        }).catch((e) => console.error(`Got error: ${e.message}`));
};
exports.airports = function(req, res) {
    const city = req.params.city;
    getApiData(airportsUrl + city)
        .then((airlines) => {
            try {
                res.send(airlines);
            } catch (e) {
                console.error(e.message);
            }
        }).catch((e) => console.error(`Got error: ${e.message}`));
};
exports.search = function(req, res) {
    // const { from, to, date } = req.params;
    const from = 'Sydney';
    const to = 'New York';
    const date = new Date(2017,10,25);
    const getStartingLocationAirports = getApiData(airportsUrl + from);
    const getDestinationAirports = getApiData(airportsUrl + to);
    const getAirlines = getApiData(airlinesUrl);
    const dates = datesArray(date);
    Promise.all([getStartingLocationAirports, getDestinationAirports, getAirlines])
        .then(fetchedData => {
            const startLocationAirports = fetchedData[0];
            const destinationAirports = fetchedData[1];
            const airlines = fetchedData[2];
            console.log('startLocationAirports[0]',startLocationAirports[0].airportCode);
            const uri = createFlightSearchUrl(
                airlines[0].code,
                dateString(dates[0]),
                startLocationAirports[0].airportCode,
                destinationAirports[0].airportCode
            );
            console.log('url: ', uri);
            console.log('url', searchUrl);
            getApiData(uri)
                .then(flight => console.log('\n\nflight:', flight))
                .catch((e) => console.error(`Error while fetching flight: ${e.message}`));
        })
        .catch(error => console.error(`Fetching data error: ${error.message}`));
};