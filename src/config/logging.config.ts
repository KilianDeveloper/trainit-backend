import { logger as expressLogger } from 'express-winston';
import { createLogger, format, transports } from 'winston';

export const logger = createLogger({
    transports: [
        new transports.Console(),
        new transports.File({
            filename: './logs/application_logs.log'
        })
    ],
    format: format.combine(
        format.colorize(),
        format.timestamp({
           format: 'DD.MM.YYYY HH:mm:ss'
       }),
        format.printf(info => `[${info.timestamp as string}]: ${info.level}: ${info.message as string}`),
    )
});

export const requestLogger = expressLogger({
    transports:[
        new transports.Console(),
        new transports.File({
            filename: './logs/application_logs.log'
        })
    ],
    format:
    format.combine(
        format.timestamp({
           format: 'DD.MM.YYYY HH:mm:ss'
       }),
       format.printf(info => `[${info.timestamp as string}]: ${info.message as string}`),
    ),
    meta: false,
    msg: "HTTP  ",
    expressFormat: true,
    colorize: true,
    ignoreRoute: () => false
})