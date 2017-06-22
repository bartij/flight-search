const expect = require('chai').expect;
const should = require('chai').should();
const moment = require('moment');
const sinon = require('sinon');
const request = require('request-promise');

const helpers = require('../helpers/handlingDataHelpers');
const dateTimeHelpers = require('../helpers/dateTimeHelpers');
const aggregateFlightData = require('../helpers/handlingDataHelpers').aggregateFlightData;
const dummyFlights = require('./resources/dummyFlightsResponse').flights;
const dummyAirports = require('./resources/dummyAirportsResponse');
const dummyAirlines = require('./resources/dummyAirlinesResponse');

describe('Helper functions', () => {
    beforeEach((done) => {
        done();
    });

    afterEach((done) => {
        const sinonKey = Object.keys(sinon.stub())[0];
        if (Object.keys(request.get)[0] === sinonKey) {
            request.get.restore();
        }
        done();
    });

    it('should create correct searchUrl', () => {
        const airlineCode = 'QF';
        const date = '20171011';
        const from = 'FRY';
        const to = 'XYZ';
        const url = helpers.createFlightSearchUrl(airlineCode, date, from, to);
        const expectedUrl = `${helpers.searchUrlBase}${airlineCode}?date=${date}&from=${from}&to=${to}`;

        expect(url).to.deep.equal(expectedUrl);
    });

    it('should throw an error when some argument is missing in createFlightSearchUrl call', () => {
        const airlineCode = 'QF';
        const date = '20171011';
        const from = 'FRY';
        try {
            helpers.createFlightSearchUrl(airlineCode, date, from);
        } catch (error) {
            expect(error).to.be.true;
        }

    });

    it('should create a request with provided url on getApiData call', () => {
        const host = 'www.fakeurl.com';
        const url = `http://${host}`;
        const request = helpers.getApiData(url);

        request.should.have.property('host').eql(host);
        request.should.have.property('method').eql('GET');
    });

    it('should throw an error when no url is provided to getApiData', () => {
        try {
            helpers.getApiData();
        } catch (error) {
            expect(error).to.be.true;
        }
    });

    it('should throw an error when wrong url is provided to getApiData', () => {
        const url = 'wrongurl';
        try {
            helpers.getApiData(url);
        } catch (error) {
            expect(error).to.be.true;
        }
    });

    it('should create date in YYYY-MM-DD format', () => {
        const date = moment('20170628');
        const convertedDate = dateTimeHelpers.formatDate(date);

        expect(convertedDate).to.deep.equal('2017-06-28');
    });

    it('should throw an error when no date is provided to formatDate', () => {
        try {
            dateTimeHelpers.formatDate();
        } catch (error) {
            expect(error).to.be.true;
        }
    });

    it('should create dates array range: providedDay-2 - providedDay+2', () => {
        const date = moment('20170628');
        const datesArray = dateTimeHelpers.datesArray(date);

        datesArray.should.be.a('array');
        datesArray.length.should.be.eql(5);
        datesArray[0].should.be.eql(moment(date).add(-2, 'd').format('YYYY-MM-DD'));
        datesArray[1].should.be.eql(moment(date).add(-1, 'd').format('YYYY-MM-DD'));
        datesArray[2].should.be.eql(moment(date).format('YYYY-MM-DD'));
        datesArray[3].should.be.eql(moment(date).add(1, 'd').format('YYYY-MM-DD'));
        datesArray[4].should.be.eql(moment(date).add(2, 'd').format('YYYY-MM-DD'));
    });

    it('should throw an error when no date is provided to formatDate', () => {
        try {
            dateTimeHelpers.datesArray();
        } catch (error) {
            expect(error).to.not.be.eql(undefined);
        }
    });

    it('should get a time from date and time object', () => {
        const date = '2017-06-29T12:30:00+02:00';
        const time = dateTimeHelpers.getTime(date);

        time.should.be.eql('12:30PM');
    });

    it('should throw an error when no date is provided to getTime', () => {
        try {
            dateTimeHelpers.getTime();
        } catch (error) {
            expect(error).to.be.true;
        }
    });

    it('should convert minutes to hours and minutes', () => {
        const minutes = 600;
        const expectedHoursAndMinutes = '10:00';
        const hoursAndMinutes = dateTimeHelpers.minutesToHoursAndMinutes(minutes);

        hoursAndMinutes.should.be.eql(expectedHoursAndMinutes);
    });

    it('should throw an error when no minutes provided to minutesToHoursAndMinutes', () => {
        try {
            dateTimeHelpers.minutesToHoursAndMinutes();
        } catch (error) {
            expect(error).to.be.not.eql(undefined);
        }
    });

    it('should replace _ with space in the city name', () => {
        const city = 'New_York';
        const expected = 'New York';
        const handledCityName = helpers.underscoreToSpaceInCityName(city);

        handledCityName.should.be.eql(expected);
    });

    it('should throw an error when no city is provided to underscoreToSpaceInCityName', () => {
        try {
            helpers.underscoreToSpaceInCityName();
        } catch (error) {
            expect(error).to.be.true;
        }
    });

    it('should create urls array with all possible combinations to search for flights', () => {
        const airlines = [dummyAirlines[0]];
        const dates = ['2017-07-02'];
        const startAirports = dummyAirports;
        const destinationAirports = [dummyAirports[0]];
        const arrayWithUrls = helpers.createFlightsSearchUrls(airlines, dates, startAirports, destinationAirports);
        const someFlightUrl = helpers.createFlightSearchUrl(
                airlines[0].code, dates[0], startAirports[0].airportCode, destinationAirports[0].airportCode
            );

        arrayWithUrls.should.be.a('array');
        arrayWithUrls.length.should.be.eql(2);
        arrayWithUrls.indexOf(someFlightUrl).should.be.greaterThan(-1);
    });

    it('should throw an error when not enough arguments is provided to createFlightsSearchUrls', () => {
        const airlines = [{ code: 'XX' }];
        try {
            helpers.createFlightsSearchUrls(airlines);
        } catch (error) {
            expect(error).to.be.not.eql(undefined);
        }
    });

    it('should prepare requests properly', () => {
        const returnValue = 'return from stub';
        const urls = ['http://fake.com', 'http://fake.com', 'http://fake.com', 'http://fake.com',
            'http://fake.com', 'http://fake.com'];
        sinon.stub(request, 'get').withArgs(urls).returns(returnValue);
        const requests = helpers.prepareRequests(urls);

        sinon.assert.calledTwice(request.get);
        requests.length.should.be.eql(2);
    });

    it('should throw an error when empty array or no arguments is provided to prepareRequests', () => {
        try {
            helpers.prepareRequests();
        } catch (error) {
            expect(error).to.be.not.eql(undefined);
        }
        try {
            helpers.prepareRequests([]);
        } catch (error) {
            expect(error).to.be.not.eql(undefined);
        }
    });

    it('should order flights by date', () => {
        const dates = [];
        dummyFlights.forEach(f => dates.push(f.start.dateTime.slice(0,10)));
        const flights = aggregateFlightData(dummyFlights);
        const orderedFlights = helpers.orderFlightsByDate(flights, dates);

        orderedFlights.length.should.be.eql(5);
        orderedFlights.forEach((f, i) => {
            f[0].start.date.should.be.eql(dates[i]);
        });
    });

    it('should throw an error when empty array or no arguments is provided to prepareRequests', () => {
        const dates = [];
        try {
            helpers.orderFlightsByDate();
        } catch (error) {
            expect(error).to.be.not.eql(undefined);
        }
        try {
            helpers.orderFlightsByDate(dates);
        } catch (error) {
            expect(error).to.be.not.eql(undefined);
        }
    });
});