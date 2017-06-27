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

const underscoreToSpaceInCityName = city => city !== undefined ? city.replace('_', ' ') : Error('No city provided');

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

const createFlightsSearchUrls = (airlines, dates, startAirportCode, destinationAirportCode) => {
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
    let flightSearchUrls = [];
    let url;
    let now = moment().format('YYYY-MM-DD');
    airlines.map(airline => {
        dates.map(date => {
            const convertedDate = dateTimeHelpers.formatDate(date);
            if (now <= convertedDate) {
                url = createFlightSearchUrl(
                    airline.code,
                    dateTimeHelpers.formatDate(date),
                    startAirportCode,
                    destinationAirportCode
                );
                flightSearchUrls.push(url);
            }
        });
    });
    return flightSearchUrls;
};

const prepareRequests = (urls) => {
    let requests = [];
    if (urls === undefined || urls.length < 1) {
        throw Error('No urls to prepare requests');
    } else {
        urls.map(url => requests.push(getApiData(url)));
    }
    return requests;
};

const orderFlightsByDate = (flights, dates) => {
    if (arguments.length < 2) {
        throw Error('Not enough arguments to order flights');
    }
    let newFlightsArray = [];
    dates.forEach((date, index) => {
        newFlightsArray.push([]);
        flights.forEach(flight => {
            if (date === flight.start.date) {
                newFlightsArray[index].push(flight);
            }
        });
    });
    return newFlightsArray;
};

module.exports = {
    prepareRequests,
    createFlightSearchUrl,
    createFlightsSearchUrls,
    getApiData,
    aggregateFlightData,
    underscoreToSpaceInCityName,
    orderFlightsByDate,
    searchUrlBase
};