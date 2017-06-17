const request = require('request-promise');
const moment = require('moment');

const searchUrlBase = 'http://node.locomote.com/code-task/flight_search/';
const createFlightSearchUrl = (airlineCode, date, from, to) => {
    if (arguments.length < 4) {
        throw Error('Not enough arguments to create flight search url');
    }
    return `${searchUrlBase}${airlineCode}?date=${date}&from=${from}&to=${to}`;
};

const getApiData = (uri) =>
    uri !== undefined && uri.indexOf('.') > -1 && (uri.indexOf('http://') > -1 || uri.indexOf('https://') > -1) ?
        request.get({ uri, json: true }) : Error('No uri provided');

const formatDate = (date) =>
    (date !== undefined) ? moment(date).format('YYYY-MM-DD') : Error('No date provided');

const datesArray = (middleDate) => {
    if (middleDate === undefined) {
        throw Error('No date provided');
    }
    let datesArray = [moment(middleDate).add(-2, 'd'), moment(middleDate).add(-1, 'd'), moment(middleDate),
        moment(middleDate).add(1, 'd'), moment(middleDate).add(2, 'd')];
    return datesArray.map(date => formatDate(date));
};

const getTime = (date) =>
    (date !== undefined) ? moment(date).format('h:mmA') : Error('No date provided');

const minutesToHoursAndMinutes = (minutes) => {
    if (minutes === undefined) {
        throw Error('No flight duration minutes provided');
    }
    const hours = Math.floor(minutes/60);
    let mins = minutes % 60;
    mins = mins.toString();
    mins = mins.length === 1 ? '0' + mins : mins;
    return hours.toString() + ':' + mins;
};

const handleCityWithSpaces = city => city !== undefined ? city.replace('_', ' ') : Error('No city provided');

const aggregateFlightData = (flights) =>
    flights.map(flight => ({
        flightNum: flight.flightNum,
        airline: flight.airline.name,
        start: {
            date: formatDate(flight.start.dateTime),
            time: getTime(flight.start.dateTime),
            airport: flight.start.airportName,
        },
        finish: {
            time: getTime(flight.finish.dateTime),
            airport: flight.finish.airportName,
        },
        duration: minutesToHoursAndMinutes(flight.durationMin),
        price: flight.price
    }));

const createFlightsSearchUrls = (airlines, dates, startAirports, destinationAirports) => {
    if (arguments.length < 4) {
        throw Error('Not enough arguments to create search request');
    }
    if (formatDate(dates[dates.length-1]) < moment()) {
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
                    const convertedDate = formatDate(date);
                    if (moment().isBefore(convertedDate)) {
                        url = createFlightSearchUrl(
                            airline.code, formatDate(date), startAirport.airportCode, destAirport.airportCode
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
    formatDate,
    getTime,
    aggregateFlightData,
    handleCityWithSpaces,
    datesArray,
    orderFlightsByDate,
    minutesToHoursAndMinutes,
    searchUrlBase
};