// Optional logger - falls back to console if Winston not available
let winston: any = null;

try {
  winston = require('winston');
} catch (error) {
  console.log('Winston not available, using console logging');
}

class Logger {
  private logger: any;

  constructor() {
    if (winston) {
      this.logger = winston.createLogger({
        level: 'info',
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.errors({ stack: true }),
          winston.format.json()
        ),
        transports: [
          new winston.transports.Console({
            format: winston.format.simple()
          })
        ]
      });
    } else {
      this.logger = console;
    }
  }

  info(message: string, meta?: any) {
    if (winston && this.logger.info) {
      this.logger.info(message, meta);
    } else {
      console.log(`INFO: ${message}`, meta || '');
    }
  }

  error(message: string, meta?: any) {
    if (winston && this.logger.error) {
      this.logger.error(message, meta);
    } else {
      console.error(`ERROR: ${message}`, meta || '');
    }
  }

  warn(message: string, meta?: any) {
    if (winston && this.logger.warn) {
      this.logger.warn(message, meta);
    } else {
      console.warn(`WARN: ${message}`, meta || '');
    }
  }

  debug(message: string, meta?: any) {
    if (winston && this.logger.debug) {
      this.logger.debug(message, meta);
    } else {
      console.debug(`DEBUG: ${message}`, meta || '');
    }
  }
}

export const logger = new Logger();
export default logger;
