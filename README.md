# @emartech/rabbitmq-worker

## BaseWorker

Automatically logs worker failures with context and elapsed time on success run.

```javascript
const { BaseWorker } = require('@emartech/rabbitmq-worker');

class MyWorker extends BaseWorker {

  async run(options) {
    console.log(options); // { option: 'foo' }
    console.log(this.config.foo); // bar
    
    if (errorHappened) {
      this.retry('Something happened', 400); // retry(<message, errorCode>) is a built-in method
    }
  }

}

MyWorker
  .create('my-worker-log-namespace')
  .execute({foo: 'bar'}, { option: 'foo' });
```

## Ignition

Starts the given type of worker to consume a RabbitMQ queue.

A sample worker starting script `my-worker.js`:

```javascript
const { Ignition } = require('@emartech/rabbitmq-worker');
const workerPool = require('./worker-pool');

Ignition.create(workerPool).start('MyWorker');
```

### Configuration

`@emartech/rabbitmq-worker` uses [`node-config`](https://www.npmjs.com/package/config) `package for configuration.

#### Required configuration example
```javascript
{
  "RabbitMQ": "rabbitmq://connection"
  "Workers": {
    "MyWorker": { // All worker requires a config for it to run
      "queueName": "my-worker", // The queue's name to get options (message)
      "concurrency": 3, // Number of worker instances to start
      "prefetchCount": 10, // Prefetch count for consumer
      "autoNackTime": 60000, // Auto time-out for worker
      "customConfigVar": "foo"
    }
  }
}
```

### Worker pool example

```javascript
{
  MyWorker: require('./workers/my-worker')
}
```

