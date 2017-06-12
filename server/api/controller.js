const handlingDataHelpers = require('./handlingDataHelpers');
const moment = require('moment');

const getApiData = handlingDataHelpers.getApiData;
const handleCityWithSpaces = handlingDataHelpers.handleCityWithSpaces;
const aggregateFlightData = handlingDataHelpers.aggregateFlightData;
const prepareRequests = handlingDataHelpers.prepareRequests;
const datesArray = handlingDataHelpers.datesArray;
const createFlightsSearchRequests = handlingDataHelpers.createFlightsSearchRequests;
const orderFlightsByDate = handlingDataHelpers.orderFlightsByDate;

const airlinesUrl = 'http://node.locomote.com/code-task/airlines';
const airportsUrl = 'http://node.locomote.com/code-task/airports?q=';

const airlines = (req, res) => {
    console.log('date', moment('20170122'));
    getApiData(airlinesUrl)
        .then((airlines) => {
            try {
                res.send(airlines);
            } catch (e) {
                console.error(e.message);
            }
        }).catch((e) => console.error(`Got error: ${e.message}`));
};

const airports = (req, res) => {
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

const search = (req, res) => {
    let { from, to, date } = req.body;
    from = handleCityWithSpaces(from);
    to = handleCityWithSpaces(to);
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
            const flightsRequests = prepareRequests(flightsSearchUrls);

            Promise.all(flightsRequests)
                .then(flights => {
                    flights = [].concat.apply([], flights);
                    flights = aggregateFlightData(flights);
                    const orderedFlights = orderFlightsByDate(flights, dates);
                    res.send(orderedFlights);
                })
                .catch(error => {
                    console.error('Error while searching for flights:', error);
                    res.status(500).send('Appeared problem with fetching flights data');
                });
        })
        .catch(error => {
            console.error(`Fetching data error: ${error.message}`);
            res.status(500).send('Appeared problem with fetching airports/airlines data');
        });
};

module.exports = { airlines, airports, search };
