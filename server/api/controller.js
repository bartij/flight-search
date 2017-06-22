const handlingDataHelpers = require('../helpers/handlingDataHelpers');
const datesArray = require('../helpers/dateTimeHelpers').datesArray;
const airportsUrl = require('../constants/urls').airportsUrl;
const airlinesUrl = require('../constants/urls').airlinesUrl;

const getApiData = handlingDataHelpers.getApiData;
const underscoreToSpaceInCityName = handlingDataHelpers.underscoreToSpaceInCityName;
const aggregateFlightData = handlingDataHelpers.aggregateFlightData;
const prepareRequests = handlingDataHelpers.prepareRequests;
const createFlightsSearchUrls = handlingDataHelpers.createFlightsSearchUrls;
const orderFlightsByDate = handlingDataHelpers.orderFlightsByDate;

const airlines = (req, res) => getApiData(airlinesUrl)
    .then((airlines) => {
        res.send(airlines);
    }).catch((e) => {
        res.status(500).send('Server error');
        console.error(`Got error: ${e.message}`);
    });

const airports = (req, res) => {
    const city = req.params.city;
    getApiData(airportsUrl + city)
        .then((airports) => {
            if (airports.length > 0) {
                res.send(airports);
            } else {
                res.send({ errorMessage: `No such city ${city}` });
            }
        }).catch((e) => {
            res.status(500).send('Server error');
            console.error(`Got error: ${e.message}`);
        });
};

const search = (req, res) => {
    let { from, to, date } = req.body;
    from = underscoreToSpaceInCityName(from);
    to = underscoreToSpaceInCityName(to);
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
                createFlightsSearchUrls(airlines, dates, startAirports, destinationAirports);
            const flightsRequests = prepareRequests(flightsSearchUrls);

            Promise.all(flightsRequests)
                .then(flights => {
                    flights = [].concat.apply([], flights);
                    flights = aggregateFlightData(flights);
                    const orderedFlights = orderFlightsByDate(flights, dates);
                    res.send({ flights: orderedFlights, dates: dates });
                })
                .catch(error => {
                    console.error('Error while searching for flights:', error);
                    res.status(500).send('Server error: problem with fetching flights data\nPlease try again');
                });
        })
        .catch(error => {
            console.error(`Fetching data error: ${error.message}`);
            res.status(500).send('Server error: problem with fetching airports/airlines data\nPlease try again');
        });
};

module.exports = { airlines, airports, search };
