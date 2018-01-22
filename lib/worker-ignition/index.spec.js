'use strict';

const WorkerIgnition = require('./index');
const Throng = require('../throng');
const config = require('config');
const Consumer = require('@emartech/rabbitmq-client').Consumer;

class TestWorker {
  static create() { return new TestWorker; }

  execute() {}
}

describe('WorkerIngnition', function() {

  const workerConfig = {
    concurrency: 123,
    queueName: 'queue-name',
    prefetchCount: 1234,
    autoNackTime: 2345,
    customOption: 'value'
  };

  let subject;
  let executeSpy;

  beforeEach(function() {
    let configGetStub = this.sandbox.stub(config, 'get');
    configGetStub.withArgs('Workers.TestWorker').returns(workerConfig);
    configGetStub.withArgs('RabbitMQ').returns('rabbitmq-config');

    executeSpy = this.sandbox.spy(TestWorker.prototype, 'execute');
    this.sandbox.stub(executeSpy, 'bind')
      .withArgs(
        this.sinon.match.instanceOf(TestWorker),
        this.sinon.match({ customOption: 'value' })
      )
      .returns('bindedExecute');
    subject = new WorkerIgnition({ TestWorker });
  });


  describe('#startWorkerFactory', function() {
    let startWorker;

    beforeEach(function() {
      startWorker = subject.startWorkerFactory('TestWorker');
    });

    it('returns a function', function() {
      expect(startWorker).to.be.a('function');
    });

    context('calling the worker', function() {

      context('consumer handling', function() {
        let consumer;

        beforeEach(function() {
          consumer = { process: this.sandbox.spy() };
          this.sandbox.stub(Consumer, 'create').returns(consumer);
          startWorker();
        });

        it('creates one for worker', function() {
          expect(Consumer.create).have.been.calledWith('rabbitmq-config', {
            logger: 'workers:TestWorker:queue',
            channel: 'queue-name',
            prefetchCount: 1234,
            autoNackTime: 2345,
            onMessage: 'bindedExecute'
          });
        });

        it('starts to process it', function() {
          expect(consumer.process).to.have.been.called;
        });
      });
    });
  });


  describe('#start', function() {
    it('starts workers with proper config', function() {
      this.sandbox.stub(Throng, 'throng');
      this.sandbox.stub(subject, 'startWorkerFactory').withArgs('TestWorker').returns('start function');

      subject.start('TestWorker');

      expect(Throng.throng).to.have.been.calledWithMatch(this.sinon.match({ workers: 123, start: 'start function' }));
    });
  });

});
