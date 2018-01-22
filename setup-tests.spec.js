'use strict';

const sinon = require('sinon');
const chai = require('chai');
const sinonChai = require('sinon-chai');
const chaiAsPromised = require('chai-as-promised');
const TestClock = require('./test-clock');


before(function() {
  chai.use(sinonChai);
  chai.use(chaiAsPromised);
});

beforeEach(function() {
  this.sandbox = sinon.sandbox.create();
  global.expect = chai.expect;
  this.sinon = sinon;
  this.clock = new TestClock(this.sinon);
});

afterEach(function() {
  this.sandbox.restore();
  this.clock.teardown();
});
