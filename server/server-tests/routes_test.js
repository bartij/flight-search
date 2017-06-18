const request = require('request-promise');
const chai = require('chai');
const chaiHttp = require('chai-http');
const sinon = require('sinon');
const proxyquire =  require('proxyquire');

const server = require('../server');
const helpers = require('../helpers/handlingDataHelpers');
const dummyAirlines = require('./resources/dummyAirlinesResponse');
const dummyAirports = require('./resources/dummyAirportsResponse');
const dummyFlights = require('./resources/dummyFlightsResponse');
const airlinesUrl = require('../constants/urls').airlinesUrl;
const airportsUrl = require('../constants/urls').airportsUrl;

const should = chai.should();
chai.use(chaiHttp);


describe('Routes', () => {
    beforeEach((done) => {
        done();
    });

    afterEach((done) => {
        const sinonKey = Object.keys(sinon.stub())[0];
        if (Object.keys(request.get)[0] === sinonKey) {
            request.get.restore();
        }
        if (Object.keys(helpers.getApiData)[0] === sinonKey) {
            helpers.getApiData.restore();
        }
        if (Object.keys(helpers.prepareRequests)[0] === sinonKey) {
            helpers.prepareRequests.restore();
        }
        done();
    });

    it('should respond properly on /airlines request', (done) => {
        const requestOptions = { uri: airlinesUrl, json: true };
        sinon.stub(request, 'get').withArgs(requestOptions).returns(Promise.resolve(dummyAirlines));

        chai.request(server)
            .get('/airlines')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(6);
                done();
            });

    });

    it('should catch an error on /airlines request when server respond with error', (done) => {
        const requestOptions = { uri: airlinesUrl, json: true };
        sinon.stub(request, 'get').withArgs(requestOptions).returns(Promise.reject('Error mock'));

        chai.request(server)
            .get('/airlines')
            .end((err, res) => {
                res.should.have.status(500);
                done();
            });
    });

    it('should respond properly on /airports request', (done) => {
        const city = 'Warsaw';
        const requestOptions = { uri: airportsUrl + city, json: true };
        sinon.stub(request, 'get').withArgs(requestOptions).returns(Promise.resolve(dummyAirports));

        chai.request(server)
            .get(`/airports/${city}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(2);
                done();
            });
    });

    it('should send message about no such city if not existing city provided', (done) => {
        const city = 'Fake city';
        const requestOptions = { uri: airportsUrl + city, json: true };
        sinon.stub(request, 'get').withArgs(requestOptions).returns(Promise.resolve([]));

        chai.request(server)
            .get(`/airports/${city}`)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('errorMessage').eql(`No such city ${city}`);
                done();
            });
    });

    // it('should respond properly on /search route request', (done) => {
    //     const getApiDataStub = sinon.stub(helpers, 'getApiData');
    //     getApiDataStub.onCall(0).returns(Promise.resolve(dummyAirports));
    //     getApiDataStub.onCall(1).returns(Promise.resolve(dummyAirports));
    //     getApiDataStub.onCall(2).returns(Promise.resolve(dummyAirlines));
    //     sinon.stub(helpers, 'prepareRequests').callsFake(() => Promise.resolve(dummyFlights));
    //
    //     chai.request(server)
    //         .post('/search')
    //         .send({ from: 'Warsaw', to: 'Paris', date: '20171031' })
    //         .end((err, res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a('object');
    //             res.body.should.have.property('flights');
    //             res.body.should.have.property('dates');
    //             res.body.flights.length.should.be.eql(dummyFlights.flights.length);
    //             res.body.dates.length.should.be.eql(dummyFlights.dates.length);
    //             done();
    //         });
    // }).timeout(10000);
});
