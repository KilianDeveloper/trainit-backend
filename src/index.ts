import cors from 'cors'
import * as dotEnv from 'dotenv'
import express from 'express'
import helmet from 'helmet'
import { createServer } from 'https'
import * as path from "path"
import { initializeCertificates } from './config/certificates.config'
import { logger, requestLogger } from './config/logging.config'
import * as databaseConnector from './config/mysql.connector'
import { DATA_SOURCES } from './config/vars.config'
import { initializeFirebase } from './firebase/initialization'
import { migrateToNewestVersion } from './migration/migration'
import { TrainingPlanRouter } from './routes/TrainingPlanRoutes'
import { UserRouter } from './routes/UserRoutes'

dotEnv.config()

const port = DATA_SOURCES.applicationDataSource.PORT

const app = express()
const credentials = initializeCertificates()

app.use(requestLogger)

initializeFirebase()

migrateToNewestVersion().then(migrationCount => {
  logger.info(`Migrated successful ${migrationCount.added} files (${migrationCount.total} in total)`)
  databaseConnector.init()

  app.use(helmet())
  app.use(express.json())
  app.use(cors())

  app.use(express.urlencoded({ extended: true }));

  app.use("/user", UserRouter)
  app.use("/trainingplan", TrainingPlanRouter)

  app.use("/texts", express.static(path.join(__dirname, '../data/texts')))

  const httpsServer = createServer(credentials, app)

  httpsServer.listen(port, "0.0.0.0", () => logger.info(`Server listening to port ${port}`))
}).catch((ex: Error) => {
  logger.error("Error on Migration")
  logger.error(ex.stack)
  process.exit(1)
})