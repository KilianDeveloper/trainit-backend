import { NextFunction, Request, Response } from 'express'
import { auth } from 'firebase-admin'
import { logger } from '../config/logging.config'
import { DATA_SOURCES } from '../config/vars.config'
import * as responses from '../utils/http-responses'
const DEBUG = DATA_SOURCES.applicationDataSource.DEBUG

export const authenticationMiddleware = async (request: Request, response: Response, next: NextFunction) => {
    try {
        if(request.originalUrl.startsWith("/user/photo") && request.method === "GET"){
            next()
            return
        }
        const headerToken = request.headers.authorization;
        if (!headerToken) return response.status(401).send(responses.wrongAuthenticationMethod);
        if (headerToken && headerToken.split(" ")[0] !== "Bearer")
            response.status(401).send(responses.invalidToken).status(401);

        const token = headerToken.split(" ")[1];
        if (!DEBUG) {
            try {
                const decodedToken = await auth().verifyIdToken(token)
                if (decodedToken.email_verified) {
                    response.locals.user = decodedToken.uid
                    next()
                } else response.send(responses.emailNotVerified)
            } catch (ex: any) {
                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                if ((ex.code || "") === "auth/id-token-expired") response.status(401).send(responses.tokenExpired)
                else {
                    logger.error(ex)
                    response.sendStatus(500)
                }
            }
        }
        else auth().getUserByEmail('legojovo@gmx.de').then(
            (userRecord) => {
                response.locals.user = userRecord.uid
                next()
            }).catch((ex) => {
                logger.error(ex)
                response.send(responses.unexpectedError)
            })
    } catch (ex) {
        logger.error(ex)
        response.send(responses.unexpectedError)
    }
}