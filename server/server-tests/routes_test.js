const request = require('supertest');
const chai = require('chai');
const server = require('../server');
// const mockery = require('mockery');
const sinon = require('sinon');
const helpers = require('../api/handlingDataHelpers');

describe('Routes should respond correctly', () => {
    beforeEach((done) => {
        console.log('before');
        sinon.stub(helpers, 'getApiData');
        done();
    });

    afterEach((done) => {
        console.log('after');
        helpers.getApiData.restore();
        done();
    });

    it('gets a 200 response on root path', (done) => {
        request(server)
            .get('/')
            .set('Content-Type', 'application/json')
            .expect(200)
            .end(done);
    });

    it('gets a 200 response on /airports path', (done) => {
        request(server)
            .get('/airlines')
            .set('Content-Type', 'application/json')
            .expect(sinon.assert.calledOnce(helpers.getApiData))
            // .then(response => {
            //     chai.expect(response.body.leo).to.deep.equal('messi');
            //     done();
            // })
            // .catch(err => {
            //     throw err;
            // });
            .end(done)
    });
    //
    // it('gets a 200 response on /airlines path', (done) => {
    //     request(server)
    //         .get('/airports')
    //         .set('Content-Type', 'application/json')
    //         .expect(200)
    //         .then(response => {
    //             chai.expect(response.body.leo).to.deep.equal('messi');
    //             done();
    //         })
    //         .catch(err => {
    //             throw err;
    //         });
    // });
    //
    // it('gets a 200 response on /search path', (done) => {
    //     request(server)
    //         .get('/search')
    //         .set('Content-Type', 'application/json')
    //         .expect(200)
    //         .then(response => {
    //             chai.expect(response.body.leo).to.deep.equal('messi');
    //             done();
    //         })
    //         .catch(err => {
    //             throw err;
    //         });
    // });
});