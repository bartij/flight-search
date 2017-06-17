const handlingDataHelpers = require('./handlingDataHelpers');

const getApiData = handlingDataHelpers.getApiData;
const handleCityWithSpaces = handlingDataHelpers.handleCityWithSpaces;
const aggregateFlightData = handlingDataHelpers.aggregateFlightData;
const prepareRequests = handlingDataHelpers.prepareRequests;
const datesArray = handlingDataHelpers.datesArray;
const createFlightsSearchUrls = handlingDataHelpers.createFlightsSearchUrls;
const orderFlightsByDate = handlingDataHelpers.orderFlightsByDate;

const airlinesUrl = 'http://node.locomote.com/code-task/airlines';
const airportsUrl = 'http://node.locomote.com/code-task/airports?q=';

const airlines = (req, res) => getApiData(airlinesUrl)
    .then((airlines) => {
        try {
            res.send(airlines);
        } catch (e) {
            res.status(500).send('Server error');
            console.error(e.message);
        }
    }).catch((e) => {
        res.status(500).send('Server error');
        console.error(`Got error: ${e.message}`);
    });

const airports = (req, res) => {
    const city = req.params.city;
    getApiData(airportsUrl + city)
        .then((airports) => {
            try {
                if (airports.length > 0) {
                    res.send(airports);
                } else {
                    res.send({ errorMessage: `No such city ${city}` });
                }
            } catch (e) {
                res.status(500).send('Server error');
                console.error(e.message);
            }
        }).catch((e) => {
            res.status(500).send('Server error');
            console.error(`Got error: ${e.message}`);
        });
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
            // console.log(fetchedData[0][0], fetchedData[1][0]);
            const startAirports = fetchedData[0];
            const destinationAirports = fetchedData[1];
            const airlines = fetchedData[2];
            const flightsSearchUrls =
                createFlightsSearchUrls(airlines, dates, startAirports, destinationAirports);
            const flightsRequests = prepareRequests(flightsSearchUrls);
            // console.log('prepareReq',flightsRequests[0]);

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

module.exports = { airlines, airports, search, airlinesUrl, airportsUrl };
