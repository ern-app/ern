import path from "node:path";
import winston from "winston";
import { LOG_FILE_MAX_FILES, LOG_FILE_MAX_SIZE } from "./constants";

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), "logs");

// Simple BigInt replacer function
const bigIntReplacer = (_key: string, value: unknown) => {
  return typeof value === "bigint" ? `${value}n` : value;
};

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, service, ...meta }) => {
      const metaStr = Object.keys(meta).length
        ? ` ${JSON.stringify(meta, bigIntReplacer, " ")}`
        : "";
      return `${timestamp} [${level.toUpperCase().slice(0, 4)}] [${service}]: ${message}${metaStr}`;
    }),
  ),
  transports: [
    // Write all logs with importance level of `error` or less to `error.log`
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: LOG_FILE_MAX_SIZE,
      maxFiles: LOG_FILE_MAX_FILES,
    }),
    // Write all logs to `combined.log`
    new winston.transports.File({
      filename: path.join(logsDir, process.env.LOG_FILE || "harvest-bot.log"),
      maxsize: LOG_FILE_MAX_SIZE,
      maxFiles: LOG_FILE_MAX_FILES,
    }),
  ],
});

// Always log to console in development with debug level
logger.add(
  new winston.transports.Console({
    level: "debug",
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple(),
      winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const metaStr = Object.keys(meta).length
          ? JSON.stringify(meta, bigIntReplacer)
          : "";
        return `${timestamp} [${level}]:\t${message} ${FgCyan}${metaStr.replace(/"/g, "")}${Reset}`;
      }),
    ),
  }),
);

export const createLogger = (id: string, inner?: string) => ({
  debug: (msg: string, ...args: unknown[]) =>
    logger.debug(`${prefix(id, inner)}\t${msg}`, ...args),
  info: (msg: string, ...args: unknown[]) =>
    logger.info(`${prefix(id, inner)}\t${msg}`, ...args),
  warn: (msg: string, ...args: unknown[]) =>
    logger.warn(`${prefix(id, inner)}\t${msg}`, ...args),
  error: (msg: string, ...args: unknown[]) =>
    logger.error(`${prefix(id, inner)}\t${msg}`, ...args),
});

const FgCyan = "\x1b[36m";
const Reset = "\x1b[0m";

const prefix = (id: string, inner?: string) => {
  let text: string;
  if (inner) {
    text = `[${id}/${inner}]`;
  } else {
    text = `[${id}]`;
  }
  return `${FgCyan}${text}${Reset}`;
};
