const request = require('request-promise');
const moment = require('moment');

const dateTimeHelpers = require('../helpers/dateTimeHelpers');
const searchUrlBase = require('../constants/urls').searchUrlBase;

const createFlightSearchUrl = (airlineCode, date, from, to) => {
    if (arguments.length < 4) {
        throw Error('Not enough arguments to create flight search url');
    }
    return `${searchUrlBase}${airlineCode}?date=${date}&from=${from}&to=${to}`;
};

const getApiData = (uri) =>
    uri !== undefined && uri.indexOf('.') > -1 && (uri.indexOf('http://') > -1 || uri.indexOf('https://') > -1) ?
        request.get({ uri, json: true }) : Error('No uri provided');

const handleCityWithSpaces = city => city !== undefined ? city.replace('_', ' ') : Error('No city provided');

const aggregateFlightData = (flights) =>
    flights.map(flight => ({
        flightNum: flight.flightNum,
        airline: flight.airline.name,
        start: {
            date: dateTimeHelpers.formatDate(flight.start.dateTime),
            time: dateTimeHelpers.getTime(flight.start.dateTime),
            airport: flight.start.airportName,
        },
        finish: {
            time: dateTimeHelpers.getTime(flight.finish.dateTime),
            airport: flight.finish.airportName,
        },
        duration: dateTimeHelpers.minutesToHoursAndMinutes(flight.durationMin),
        price: flight.price
    }));

const createFlightsSearchUrls = (airlines, dates, startAirports, destinationAirports) => {
    if (arguments.length < 4) {
        throw Error('Not enough arguments to create search request');
    }
    if (dateTimeHelpers.formatDate(dates[dates.length-1]) < moment()) {
        throw Error('Past dates provided');
    }
    if (!(airlines instanceof Array)) {
        airlines = [airlines];
    }
    if (!(dates instanceof Array)) {
        dates = [dates];
    }
    if (!(startAirports instanceof Array)) {
        startAirports = [startAirports];
    }
    if (!(destinationAirports instanceof Array)) {
        destinationAirports = [destinationAirports];
    }
    let flightSearchUrls = [];
    let url;
    airlines.map(airline => {
        dates.map(date => {
            startAirports.map(startAirport => {
                destinationAirports.map(destAirport => {
                    const convertedDate = dateTimeHelpers.formatDate(date);
                    if (moment().isBefore(convertedDate)) {
                        url = createFlightSearchUrl(
                            airline.code,
                            dateTimeHelpers.formatDate(date),
                            startAirport.airportCode,
                            destAirport.airportCode
                        );
                        flightSearchUrls.push(url);
                    }
                });
            });
        });
    });
    return flightSearchUrls;
};

const prepareRequests = (urls) => {
    let requests = [];
    if (urls === undefined || urls.length < 1) {
        throw Error('No urls to prepare requests');
    } else if (urls.length < 150) {
        urls.map((url, index) => {
            if (index % 5 === 0) {
                requests.push(getApiData(url));
            }
        });
    } else if (urls.length > 150) {
        urls.map((url, index) => {
            if (index % 10 === 0) {
                requests.push(getApiData(url));
            }
        });
    } else {
        urls.map(url => requests.push(getApiData(url)));
    }
    return requests;
};

const orderFlightsByDate = (flights, dates) => {
    if (arguments.length < 2) {
        throw Error('Not enough arguments to order flights');
    }
    let newFlightsArray = [[],[],[],[],[]];
    flights.map(flight => {
        switch(flight.start.date) {
            case dates[0]:
                newFlightsArray[0].push(flight);
                break;
            case dates[1]:
                newFlightsArray[1].push(flight);
                break;
            case dates[2]:
                newFlightsArray[2].push(flight);
                break;
            case dates[3]:
                newFlightsArray[3].push(flight);
                break;
            case dates[4]:
                newFlightsArray[4].push(flight);
                break;
        }
    });
    return newFlightsArray;
};

module.exports = {
    prepareRequests,
    createFlightSearchUrl,
    createFlightsSearchUrls,
    getApiData,
    aggregateFlightData,
    handleCityWithSpaces,
    orderFlightsByDate,
    searchUrlBase
};