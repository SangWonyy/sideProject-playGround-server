import winston from 'winston';

// TODO env따라 colorize 적용
const logger: winston.Logger = winston.createLogger({
    level: 'info', // env따라 다르게..
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize())
        })
    ]
});

export {logger};
