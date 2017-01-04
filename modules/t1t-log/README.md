# t1t-log

Is a wrapper for logging that uses winston, adapted from astad-log.

```
var logger = require('t1t-log');

logger.debug('Console shows debug in development environment!!!');
logger.log('Console shows log!!!');
logger.warn('Console shows warning!!!');
logger.error('Console shows error and added to error log!!!');
```

## Use access middleware

```
app.use(require('t1t-log').middleware);
```
