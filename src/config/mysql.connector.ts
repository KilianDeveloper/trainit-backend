import 'reflect-metadata';
import { DataSource } from "typeorm";
import { ExecutedMigration } from '../migration/ExecutedMigration';
import { mySqlConnectionData } from '../migration/migration';
import { Account } from '../models/Account';
import { Friendship } from '../models/Friendship';
import { TrainingInvitation } from '../models/TrainingInvitation';
import { TrainingPlan } from '../models/TrainingPlan';
import { logger } from './logging.config';
import { DATA_SOURCES } from './vars.config';
const dataSource = DATA_SOURCES.mySqlDataSource;

export const databaseData: mySqlConnectionData = {
  host: dataSource.DB_HOST,
  port: dataSource.DB_PORT,
  userName: dataSource.DB_USER,
  password: dataSource.DB_PASSWORD,
  database:  dataSource.DB_DATABASE,
}

export const AppDataSource = new DataSource({
  type: "mysql",
  host: databaseData.host,
  port: databaseData.port,
  username: databaseData.userName,
  password: databaseData.password,
  database:  databaseData.database,
  entities: [Account, TrainingPlan, TrainingInvitation, Friendship],
  synchronize: false,
  logging: false,
})
export const MigrationDataSource = new DataSource({
  type: "mysql",
  host: databaseData.host,
  port: databaseData.port,
  username: databaseData.userName,
  password: databaseData.password,
  database: databaseData.database,
  entities: [ExecutedMigration],
  synchronize: false,
  logging: false,
  multipleStatements: true
})

export const init = () => {
  try {
    AppDataSource.initialize()
    .then(() => {
      logger.info("MySQL connection was initialized successful")
    })
    .catch((error) => console.log(error))
  } catch (error) {
    logger.error(error);
    throw new Error('failed to initialized pool');
  }
};
