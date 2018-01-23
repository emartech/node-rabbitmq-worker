'use strict';

const { RabbitMq } = require('../index');
const config = require('config');

class QueueManager {

  static create() {
    return new QueueManager;
  }


  queueWorker(workerId, data = {}) {
    const workerConfig = config.get(`Workers.${workerId}`);

    if (workerConfig.requiredKeys && !this._checkRequiredKeys(workerConfig.requiredKeys, data)) {
      throw new Error('Some required key is not defined in given data');
    }

    return this.addToQueue(workerConfig.queueName, data);
  }


  async addToQueue(queueName, data) {
    const queue = await this._connectToQueue(queueName);
    return await queue.insert(data, this._defaultOptions());
  }

  // private

  _checkRequiredKeys(requiredKeys, data) {
    return requiredKeys.every(key => key in data);
  }


  _connectToQueue(queueName) {
    return RabbitMq.create(config.get('RabbitMQ'), queueName);
  }


  _defaultOptions() {
    return { timestamp: new Date().getTime() };
  }

}

module.exports = QueueManager;
