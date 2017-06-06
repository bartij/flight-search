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
const getDate = (date) =>
    (date !== undefined) ? moment(date).format('YYYY-MM-DD') : Error('No date provided');
const getTime = (date) =>
    (date !== undefined) ? moment(date).format('h:mmA') : Error('No date provided');
const metersToKilometers = (meters) => meters/1000;
const minutesToHoursMinutes = (minutes) => {
    const hours = Math.floor(minutes/60);
    let mins = minutes % 60;
    mins = mins.toString();
    mins = mins.length === 1 ? '0' + mins : mins;
    return hours.toString() + ':' + mins;
};

const aggregateFlightData = (flights) =>
    flights.map(flight => ({
        key: flight.key,
        flightNum: flight.flightNum,
        airline: flight.airline.name,
        start: {
            date: getDate(flight.start.dateTime),
            time: getTime(flight.start.dateTime),
            airport: flight.start.airportName,
            city: flight.start.cityName
        },
        finish: {
            date: getDate(flight.finish.dateTime),
            time: getTime(flight.finish.dateTime),
            airport: flight.finish.airportName,
            city: flight.finish.cityName
        },
        plane: {
            code: flight.plane.code,
            name: flight.plane.fullname
        },
        distance: metersToKilometers(flight.distance),
        duration: minutesToHoursMinutes(flight.durationMin),
        price: flight.price
    }));

const createFlightsSearchRequests = (airlines, dates, startAirports, destinationAirports) => {
    let flightSearchUrls = [];
    let url;
    airlines.map(airline => {
        dates.map(currentDate => {
            startAirports.map(startAirport => {
                destinationAirports.map(destAirport => {
                    url = createFlightSearchUrl(airline.code, getDate(currentDate), startAirport.airportCode, destAirport.airportCode);
                    flightSearchUrls.push(url);
                });
            });
        });
    });
    return flightSearchUrls;
};

const createFlightSearchUrl = (airlineCode, date, from, to) =>
    'http://node.locomote.com/code-task/flight_search/' + airlineCode + '?date=' + date + '&from=' + from + '&to=' + to;
const airlinesUrl = 'http://node.locomote.com/code-task/airlines';
const airportsUrl = 'http://node.locomote.com/code-task/airports?q=';

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
            const startAirports = fetchedData[0];
            const destinationAirports = fetchedData[1];
            const airlines = fetchedData[2];
            const flightsSearchUrls =
                createFlightsSearchRequests(airlines, dates, startAirports, destinationAirports);
            const requests = [getApiData(flightsSearchUrls[0]), getApiData(flightsSearchUrls[10])];
            Promise.all(requests)
                .then(flights => {
                    flights = [].concat.apply([], flights);
                    flights = aggregateFlightData(flights);
                    res.send(flights);
                })
                .catch(error => {
                    console.error('Error while searching for flights:', error);
                    res.status(500).send('Something went wrong :(');
                });
        })
        .catch(error => {
            console.error(`Fetching data error: ${error.message}`);
            res.status(500).send('Something went wrong :(');
        });
};
