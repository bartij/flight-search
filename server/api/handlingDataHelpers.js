const request = require('request-promise');
const moment = require('moment');

const createFlightSearchUrl = (airlineCode, date, from, to) =>
'http://node.locomote.com/code-task/flight_search/' + airlineCode + '?date=' + date + '&from=' + from + '&to=' + to;

const getApiData = (uri) => request({
    method: 'GET',
    uri: uri,
    headers: {
        'User-Agent': 'Request-Promise'
    },
    json: true
});

const getDate = (date) =>
    (date !== undefined) ? moment(date).format('YYYY-MM-DD') : Error('No date provided');

const datesArray = (middleDate) => {
    let datesArray = [moment(middleDate).add(-2, 'd'), moment(middleDate).add(-1, 'd'), moment(middleDate),
        moment(middleDate).add(1, 'd'), moment(middleDate).add(2, 'd')];
    return datesArray.map(date => getDate(date));
};

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

const handleCityWithSpaces = city => city.replace('_', ' ');

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

const prepareRequests = (urls) => {
    let requests = [];
    urls.map((url, index) => {
        if ((index > 100 && index <= 105) || (index > 200 && index <= 205) || (index > 300 && index <= 305) || (index > 400 && index <= 405) || (index > urls.length-6 && index < urls.length)) {
            requests.push(getApiData(url));
        }
    });
    return requests;
};

const orderFlightsByDate = (flights, dates) => {
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
    createFlightsSearchRequests,
    getApiData,
    getDate,
    getTime,
    aggregateFlightData,
    handleCityWithSpaces,
    datesArray,
    orderFlightsByDate
};