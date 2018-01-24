'use strict';

const logFactory = require('@emartech/json-logger');
const BaseWorker = require('./index');
const { RetryableError } = require('@emartech/rabbitmq-client');

describe('BaseWorker', function() {

  describe('#execute', function() {

    let logger;
    let worker;

    it('calls run() with given options', function() {
      worker = new BaseWorker('logging-namespace');
      this.sandbox.spy(worker, 'run');
      const options = { foo: 'foo' };

      worker.execute(null, options);

      expect(worker.run).to.be.calledWith(options);
    });


    describe('creating config', function() {
      it('sets given logger', async function() {
        worker = new BaseWorker('logging-namespace');
        await worker.execute({ property: 'value' }, null);

        expect(worker.config).to.be.eql({ property: 'value' });
      });
    });


    describe('creating logger', function() {
      context('giving namespace', function() {
        it('creates a new logger', function() {
          worker = new BaseWorker('logging-namespace');

          expect(worker.logger).to.be.an.instanceOf(logFactory.Logger);
        });
      });

      context('giving Logger', function() {
        it('sets given logger', function() {
          const logger = logFactory('logging-namespace');

          worker = new BaseWorker(logger);

          expect(worker.logger).to.be.eql(logger);
        });
      });

      context('bad logger given', function() {
        it('throws error', function() {
          class NotALogger {}
          expect(function() { new BaseWorker(new NotALogger); }).to.throw(Error);
        });
      });
    });


    describe('logging', function() {
      beforeEach(function() {
        logger = new logFactory.Logger();

        worker = new BaseWorker(logger);
      });

      context('on success', function() {
        it('logs info', async function() {
          this.clock.setup('2017-11-21T10:55:00.000Z');
          this.sandbox.stub(logger, 'info');
          this.sandbox.stub(worker, 'run').callsFake(() => {
            this.clock.tick(42);
          });

          await worker.execute(null, { foo: 'foo', bar: 'bar' });

          expect(logger.info).to.have.been.calledWith('finished', '{"foo":"foo","bar":"bar","elapsed_time":42}');
        });
      });

      context('when there is an error', function() {
        it('logs error', async function() {
          this.sandbox.stub(logger, 'error');
          this.sandbox.stub(worker, 'run').throws(new Error('Some error'));

          try {
            await worker.execute(null, { foo: 'foo', bar: 'bar' });
          } catch (error) {
            // empty
          }

          expect(logger.error).to.have.been.calledWith('failure', 'Some error', '{"foo":"foo","bar":"bar"}');
        });

        it('throws the error', async function() {
          const expectedError = new Error('Some error');
          this.sandbox.stub(logger, 'error');
          this.sandbox.stub(worker, 'run').throws(expectedError);

          try {
            await worker.execute(null, { foo: 'foo', bar: 'bar' });
            throw new Error('should have thrown expectedError');
          } catch (error) {
            expect(error).to.eql(expectedError);
          }
        });
      });

    });

  });


  describe('#retry', function() {

    it('throws a RetryableError', async function() {
      try {
        const worker = new BaseWorker('logging-namespace');
        await worker.retry('retry message', 123);
        throw new Error('some error');
      } catch (error) {
        expect(error).to.instanceOf(RetryableError);
        expect(error.message).to.eql('retry message');
        expect(error.code).to.eql(123);
        expect(error.retryable).to.be.true;
      }
    });

  });

});

