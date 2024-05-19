import * as fs from 'fs';
import * as path from 'path';
import { MigrationDataSource } from '../config/mysql.connector';
import { ExecutedMigration } from './ExecutedMigration';

export type mySqlConnectionData = {
  host: string
  port: number
  userName: string
  password: string
  database: string
}

export const migrateToNewestVersion = async (): Promise<{ added: number, total: number }> => {
  await MigrationDataSource.initialize()
  const queryRunner = MigrationDataSource.createQueryRunner()
  await queryRunner.query("CREATE TABLE if not exists `migration` (`executedOn` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,`fileName` varchar(255) NOT NULL,PRIMARY KEY (`fileName`));")
  const repository = MigrationDataSource.getRepository(ExecutedMigration)
  const executedMigrations = await repository.findBy({})
  const notExecutedMigrationScripts = fs.readdirSync(path.join(__dirname, '../migration')).filter(name => name.endsWith('.sql')).sort().filter(name => !executedMigrations.some(migration => migration.fileName === name))

  for (const name of notExecutedMigrationScripts) {
    const migration = new ExecutedMigration()
    migration.fileName = name

    const sqlQueries = fs.readFileSync(path.join(__dirname, '../migration', `/${name}`), { encoding: "utf-8" }).split("\n").filter(text => !(text.startsWith("--") || text.startsWith("/"))).join("").replace("\n", "")
    await queryRunner.query(sqlQueries)

    await repository.save(migration)
  }
  await MigrationDataSource.destroy()
  return {
    added: notExecutedMigrationScripts.length,
    total: executedMigrations.length + notExecutedMigrationScripts.length
  }
}