import pino, { Logger } from 'pino';

export interface LoggerOptions {
  /** Service name stamped on every log line */
  service: string;
  /** Minimum log level — defaults to 'info' in production, 'debug' elsewhere */
  level?: string;
  /** Pretty-print for local dev; JSON for staging/production */
  pretty?: boolean;
}

/**
 * Creates a structured Pino logger.
 *
 * Every log line will include:
 *   { level, time, service, correlationId?, ...yourFields }
 *
 * Usage:
 *   const logger = createLogger({ service: 'identity-api' });
 *   logger.info({ userId }, 'User logged in');
 */
export function createLogger(options: LoggerOptions): Logger {
  const isDev = process.env.NODE_ENV !== 'production';
  const usePretty = options.pretty ?? isDev;

  return pino({
    level: options.level ?? (isDev ? 'debug' : 'info'),
    base: { service: options.service },
    timestamp: pino.stdTimeFunctions.isoTime,
    transport: usePretty
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  });
}

/** Singleton root logger — override per-app by calling createLogger() directly */
export const rootLogger = createLogger({ service: 'ogp' });
