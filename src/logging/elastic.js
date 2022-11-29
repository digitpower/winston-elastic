const pjson = require("../../package.json");
const path = require("path");

const uuid = require("uuid");
const { ElasticsearchTransport } = require("winston-elasticsearch");
const winston = require("winston");
// require("winston-logstash");

function CustomError() {
  // Use V8's feature to get a structured stack trace
  const oldStackTrace = Error.prepareStackTrace;
  const oldLimit = Error.stackTraceLimit;
  try {
    Error.stackTraceLimit = 3; // <- we only need the top 3
    Error.prepareStackTrace = (err, structuredStackTrace) =>
      structuredStackTrace;
    Error.captureStackTrace(this, CustomError);
    this.stack; // <- invoke the getter for 'stack'
  } finally {
    Error.stackTraceLimit = oldLimit;
    Error.prepareStackTrace = oldStackTrace;
  }
}

module.exports.CustomError = CustomError;

module.exports.getAndFormatStackTraceElement = function() {
  const stack = new CustomError().stack;
  const CALLER_INDEX = 2; // <- position in stacktrace to find deepest caller
  const element = stack[CALLER_INDEX];
  const fileName = path.basename(element.getFileName());
  return (
    element.getFunctionName() +
    "(" +
    fileName +
    ":" +
    element.getLineNumber() +
    ")"
  );
};

module.exports.logTransport = indexPrefix => {
  let spanTracerId = uuid.v1();

  const tracerLog = winston.format.printf(info => {
    console.log(`${info.timestamp} : ${info.message}`);
  });

  let consoleTransport = [
    new ElasticsearchTransport({
      ...elasticTransport(spanTracerId, indexPrefix)
    })
  ];
  const format = winston.format.combine(winston.format.timestamp(), tracerLog);
  const logger = winston.createLogger({
    format,
    transports: consoleTransport
  });
  return logger;
};

const elasticTransport = (spanTracerId, indexPrefix) => {
  // Configuring elasticsearch
  const esTransportOpts = {
    level: "info",
    index: indexPrefix,
    transformer: logData => {
      // Get and proceed Trace ID
      const spanId = spanTracerId;
      let tracerId = null;
      let userData = {};
      if (logData.meta.req) {
        tracerId = logData.meta.req.header("x-trace-id");
      }

      if (logData.meta.req.user) {
        userData = logData.meta.req.user;
      }

      return {
        "@timestamp": new Date().getTime(),
        severity: logData.level,
        stack: logData.meta.stackInfo,
        user_id: userData.id || null,
        user_type: userData.type || null,
        client_version: logData.meta.req.headers.app_version || "NOT_DEFINED",
        service_name: pjson.name,
        service_version: pjson.version,
        message: `${logData.message}`,
        data: JSON.stringify(logData.meta.data),
        trace_id: tracerId,
        span_id: spanId
      };
    },
    clientOpts: {
      node:
        "https://testdeployment.es.us-east-1.aws.found.io:443",
        //"http://localhost:9200",
      auth: {
        username: 'elastic',
        password: '****',

        //username: 'elastic',
        //password: '',
      },
      log: "info"
    }
  };
  return esTransportOpts;
};
