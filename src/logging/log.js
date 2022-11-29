const { getAndFormatStackTraceElement, logTransport } = require("./elastic");

const indexPrefix = "test_index";

class Log {
  /**
   * Log info
   * @param {msg} string contain log message
   * @param {msg} string contain log data
   */
  info(msg, data, req) {
    const logger = logTransport(indexPrefix);
    const stackInfo = getAndFormatStackTraceElement();
    const metaData = { data, req, stackInfo };
    logger.info(msg, metaData);
  }

  /**
   * Log warning
   * @param {msg} string contain log message
   * @param {msg} string contain log data
   */
  warning(msg, data, req) {
    const logger = logTransport(indexPrefix);
    const stackInfo = getAndFormatStackTraceElement();
    const metaData = { data, req, stackInfo };
    logger.warning(msg, metaData);
  }

  /**
   * Log alert
   * @param {msg} string contain log message
   * @param {msg} string contain log data
   */
  alert(msg, data, req) {
    const logger = logTransport(indexPrefix);
    const stackInfo = getAndFormatStackTraceElement();
    const metaData = { data, req, stackInfo };
    logger.alert(msg, metaData);
  }

  /**
   * Log error
   * @param {msg} string contain log message
   * @param {msg} string contain log data
   */
  error(msg, data, req) {
    const logger = logTransport(indexPrefix);
    const stackInfo = getAndFormatStackTraceElement();
    const metaData = { data, req, stackInfo };
    console.log(stackInfo);
    logger.error(msg, metaData);
  }
}

module.exports = new Log();
