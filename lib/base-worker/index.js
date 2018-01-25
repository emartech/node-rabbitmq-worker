'use strict';

const logFactory = require('@emartech/json-logger');
const { RetryableError } = require('@emartech/rabbitmq-client');
const { toSnake } = require('convert-keys');
const { kebabCase } = require('lodash');

class BaseWorker {

  static create() {
    return new this;
  }

  constructor(logger) {
    this.logger = this._createLogger(logger);
  }


  async execute(config, options) {
    this._config = config;
    const startTime = new Date().getTime();
    try {
      const result = await this.run(options);

      this.logger.info('finished', this._logData(
        Object.assign({}, options, { elapsedTime: this._elapsedTime(startTime) })
      ));

      return result;
    } catch (error) {
      this.logger.error('failure', this._logData(
        Object.assign({ message: error.message }, options)
      ));
      throw error;
    }
  }


  // eslint-disable-next-line no-unused-vars
  async run(options) {
  }


  retry(message, code) {
    throw new RetryableError(message, code);
  }


  get config() {
    return this._config;
  }

  // private

  _logData(dataToLog) {
    return toSnake(dataToLog);
  }


  _elapsedTime(startTime) {
    return new Date().getTime() - startTime;
  }


  _createLogger(logger) {
    if (logger instanceof logFactory.Logger) {
      return logger;
    } else if (typeof logger === 'string') {
      return logFactory(logger);
    } else if (logger === undefined) {
      return logFactory(kebabCase(this.constructor.name));
    } else {
      throw new Error(`Unknown logger instance or namespace: ${logger}`);
    }
  }

}

module.exports = BaseWorker;
