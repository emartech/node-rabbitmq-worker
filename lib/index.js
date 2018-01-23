'use strict';

module.exports = {
  Ignition: require('./worker-ignition'),
  BaseWorker: require('./base-worker'),
  RabbitMq: require('@emartech/rabbitmq-client').RabbitMq,
  QueueManager: require('./queue-manager')
};
