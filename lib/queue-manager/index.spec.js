'use strict';

const QueueManager = require('./index');
const { RabbitMq } = require('../index');
const config = require('config');

describe('QueueManager', function() {
  let rabbitMqInsertStub;
  let subject;
  let configStub;

  beforeEach(function() {
    configStub = this.sandbox.stub(config, 'get');
    configStub.withArgs('RabbitMQ').returns('connection-string');
    subject = new QueueManager;
    rabbitMqInsertStub = this.sandbox.stub().resolves(true);
  });


  describe('#addToQueue', function() {

    it('inserts the given data into the proper queue', async function() {
      this.sandbox.stub(RabbitMq, 'create')
        .withArgs('connection-string', 'queue-name')
        .resolves({ insert: rabbitMqInsertStub });
      const data = { foo: '1', bar: '2' };

      await subject.addToQueue('queue-name', data);

      expect(rabbitMqInsertStub).to.have.been.calledWith(data, this.sinon.match.any);
    });

  });


  describe('#queueWorker', function() {

    beforeEach(function() {
      this.sandbox.stub(QueueManager.prototype, 'addToQueue');
    });

    it('calls addToQueue with proper queue name and given data', async function() {

      configStub.withArgs('Workers.MyWorker').returns({
        queueName: 'myWorkerQueue'
      });
      const data = { foo: '1', bar: '2' };

      await subject.queueWorker('MyWorker', data);

      expect(QueueManager.prototype.addToQueue).to.have.been.calledWith('myWorkerQueue', data);
    });


    it('fails if no config for given worker name', async function() {
      configStub.restore();
      try {
        await subject.queueWorker('NotExistingWorkerName', {});
      } catch (e) {
        expect(e).to.have.property('message')
          .that.eql('Configuration property "Workers.NotExistingWorkerName" is not defined');
      }
    });


    it('fails if required keys not given in data', async function() {
      configStub.withArgs('Workers.MyWorker').returns({
        queueName: 'myWorkerQueue',
        requiredKeys: ['foo', 'bar', 'baz']
      });

      try {
        await subject.queueWorker('MyWorker', { foo: '1', bar: '2' });
      } catch (e) {
        expect(e).to.have.property('message')
          .that.eql('Some required key is not defined in given data');
      }
    });

  });


});
