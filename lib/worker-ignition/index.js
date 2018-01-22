'use strict';

const { omit } = require('lodash');
const Throng = require('../throng');
const Consumer = require('@emartech/rabbitmq-client').Consumer;
const config = require('config');


class WorkerIgnition {

  static create(workerPool) {
    return new WorkerIgnition(workerPool);
  }


  constructor(workerPool) {
    this._workerPool = workerPool;
  }


  start(workerId) {
    Throng.throng({
      workers: this._getConfigForWorker(workerId).concurrency,
      start: this.startWorkerFactory(workerId)
    });
  }


  startWorkerFactory(workerId) {
    const workerConfig = this._getConfigForWorker(workerId);
    const runtimeConfig = omit(workerConfig, ['autoNackTime', 'concurrency', 'prefetchCount', 'queueName']);
    const worker = this._workerPool[workerId].create();

    return function() {
      Consumer.create(config.get('RabbitMQ'), {
        logger: `workers:${workerId}:queue`,
        channel: workerConfig.queueName,
        prefetchCount: workerConfig.prefetchCount,
        autoNackTime: workerConfig.autoNackTime,
        onMessage: worker.execute.bind(worker, runtimeConfig)
      }).process();
    };
  }


  _getConfigForWorker(workerId) {
    return config.get(`Workers.${workerId}`);
  }

}

module.exports = WorkerIgnition;
