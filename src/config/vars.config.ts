import * as dotEnv from 'dotenv';
import 'dotenv/config';
dotEnv.config()

export const DATA_SOURCES = {
  mySqlDataSource: {
      DB_HOST: process.env.MY_SQL_DB_HOST || "localhost",
      DB_USER: process.env.MY_SQL_DB_USER || "root",
      DB_PASSWORD: process.env.MY_SQL_DB_PASSWORD || "",
      DB_PORT: parseInt(process.env.MY_SQL_DB_PORT || "3306", 10),
      DB_DATABASE: process.env.MY_SQL_DB_DATABASE || "trainIt-db",
      DB_CONNECTION_LIMIT: parseInt(process.env.MY_SQL_DB_CONNECTION_LIMIT || "4", 10),
    },
    applicationDataSource: {
      PORT: parseInt(process.env.APPLICATION_PORT || "8080", 10),
      USE_LETS_ENCRYPT: (process.env.USE_LETS_ENCRYPT || "true").toLowerCase() === "true",
      DATA_URL: "/srv/app/build/resources",
      USER_URL: "/srv/app/data/users",
      DEBUG: (process.env.DEBUG || "false").toLowerCase() === "true"
    },
    notificationDataSource: {
      EMAIL_ADDRESS: process.env.NOTIFICATION_EMAIL_ADDRESS,
      EMAIL_PASSWORD: process.env.NOTIFICATION_EMAIL_PASSWORD,
      EMAIL_PROVIDER: process.env.NOTIFICATION_EMAIL_PROVIDER,
    },
};