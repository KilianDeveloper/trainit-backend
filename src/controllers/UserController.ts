import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import { Account } from "../models/Account";
import { CalendarTraining } from "../models/CalendarTraining";
import { PersonalRecord } from "../models/PersonalRecord";
import { User } from "../models/User";
import { GetAccountFriendship } from "../models/dto/GetAccountFriendship";
import { PutBodyValues } from "../models/dto/PutBodyValues";
import { PutStatistics } from "../models/dto/PutStatistics";
import * as TrainingPlanService from "../services/TrainingPlanService";
import * as UserService from "../services/UserService";

/**
 * GET-Method to provide a User/Account with its TrainingPlan. If the segment "id" is same as the authenticated users id,
 * the requesting account will be returned as account, otherwise the user with the requested id will be returned
 * (if not existing the values will be)
 */
export const getProfile = async (request: Request, response: Response) => {
    const validation = validationResult(request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }
    const uid: string = response.locals.user
    const userId = request.params.userId
    const email = request.query.email as string | undefined

    const profile = await UserService.loadProfile(uid, email, userId)
        if(profile === null){
            response.status(404).send();
        }else{
            response.send(profile)
        }
}

/**
 * GET-Method to provide a user. If the segment "id" is not set, the requesting user(with authentication) will be returned,
 * otherwise the user with the requested id will be returned
 * (if not existing an error will be returned)
 */
export const getAccount = async (request: Request, response: Response) => {
    const validation = validationResult(request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }
    const uid: string = response.locals.user
    const account = await UserService.loadAccount(uid)
    const loadUsername = async (id: string) => {return await UserService.loadUsername(id);};
    const friendsPromise = (await  UserService.loadFriendships(uid)).map(e => GetAccountFriendship.fromFriendship(e, uid, loadUsername));
    const friends = await Promise.all(friendsPromise);

    const state: string | undefined = request.query.savedState as string
    const savedState = state ? new Date(state) : null

    if(account === null){
        response.send({
            account: null,
            trainingPlans: null,
            alreadyUpToDate: true
        })
    }else{
        if(savedState !== null && savedState >= account.lastModified){
            response.send({
                account: null,
                trainingPlans: null,
                alreadyUpToDate: true
            })
            return
        }
        const trainingPlans = await TrainingPlanService.loadTrainingPlansByAccount(uid)

        const bodyValues = await UserService.loadBodyValues(uid, 30, account)
        account.bodyFat = bodyValues.fat
        account.bodyWeight = bodyValues.weight
        account.goals = account.goals.filter((e) => !e.isDone)

        response.send({
            account,
            trainingPlans: trainingPlans.map(plan => plan.toMobileVersion()),
            friendships: friends,
            alreadyUpToDate: false,
        })
    }
}

/**
 * POST-Request to create a new account. The id of the authenticated account will be used as new user-id.
 * If the account already exists, an http-error-code 409 will be sent
 */
export const createAccount = async (request:Request, response: Response) => {
    const validation = validationResult(request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }
    const uid: string = response.locals.user
    const username: string | undefined = request.query.username as string

    if(!username){
        response.sendStatus(422)
        return
    }
    if(username === ""){
        response.sendStatus(204)
        return
    }
    if(await UserService.existsWithId(uid) === true){
        response.sendStatus(409)
        return
    }

    const newAccount = await UserService.createAccountForIdWithTrainingPlan(uid, username)
    if(newAccount === null)
        response.sendStatus(404)
    else response.send({
        success: true,
        account: newAccount.account,
        trainingPlans: [newAccount.trainingPlan]
    })
}

/**
 * PUT-Request to update an existing account. The new account-data should be provided in the body.
 * The id provided in the body will be overwritten, so the authenticated user always updates his own account
 */
 export const updateAccount = async (request:Request<unknown, unknown, Account>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user

    const account = request.body
    account.id = uid
    account.lastModified = new Date()

    const updatedAccountValue = await UserService.updateAccount(account)

    if(updatedAccountValue === false){
        const oldAccount = await UserService.loadAccount(uid)
        response.send({
            account: oldAccount,
            success: false
        })
    }else response.send({
        account: updatedAccountValue,
        success: true
    })
}

/**
 * PUT-Request to update the profile-photo of the authenticated user
 */
 export const updateProfilePhoto = (request:Request, response: Response) => {
    const uid: string = response.locals.user

    if(request.file === undefined){
        response.sendStatus(422)
        return
    }
    const file = request.file

    response.send({ success: UserService.uploadFile(file.buffer, uid) })
}

/**
 * DELETE-Request to delete the profile-photo of the authenticated user
 */
export const deleteProfilePhoto = (request:Request, response: Response) => {
    const validation = validationResult(request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user
    response.send({ success: UserService.deleteProfilePicture(uid) })
}

/**
 * PUT-Request to update the personal records of the authenticated user
 */
 export const updateStatistics = async (request:Request<unknown, unknown, PutStatistics>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user

    const body = request.body
    const favoriteCount = body.personalRecords?.filter(e => e.isFavorite).length ?? 0;
    if(favoriteCount > PersonalRecord.FAVORITE_MAX){
        response.status(422).send({ errors: "max 2 favorite personal records allowed" })
        return
    }


    const result = await UserService.updateStatistics(uid, body.personalRecords, body.goals);

    if(result === true || result === false){
        response.send({ success: result })
    }else{
        response.status(result).send({success: false})
    }

}

/**
 * PUT-Request to finish a goal of the authenticated user. A individual goal card will be returned
 */
export const finishGoal = async (request:Request, response: Response) => {
    const validation = validationResult(request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user
    const goalId = request.params.goalId
    const locale = request.query.locale as string
    const couldFinishGoal = await UserService.finishGoal(uid, goalId);
    if(!couldFinishGoal){
        response.sendStatus(400)
        return;
    }
    await UserService.generateGoalCard(uid, goalId, locale, (err, buffer) => {
        if(err !== null) response.sendStatus(400)
        response.send(buffer)
    })
}

/**
 * PUT-Request to put new body values to the statistics of the authenticated user
 */
export const putBodyValues = async (request:Request<unknown, unknown, PutBodyValues>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user

    const body = request.body

    const result = await UserService.putBodyValues(uid, body.value, body.date, body.type);

    if(result === true || result === false){
        response.send({ success: result })
    }else{
        response.status(result).send({success: false})
    }
}

/**
 * PUT-Request to follow a friend
 */
export const follow = async (request:Request<unknown, unknown, PutBodyValues>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user
    const followingId: string | undefined = request.query.id as string

    const result = await UserService.followUser(uid, followingId);

    if(result instanceof GetAccountFriendship){
        response.send({friendship: result, success: true})
    }else{
        response.status(result).send({success: false, friendship: null})
    }
}

/**
 * DELETE-Request to unfollow a friend
 */
export const unfollow = async (request:Request<unknown, unknown, PutBodyValues>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user
    const followingId: string | undefined = request.query.id as string

    const result = await UserService.unfollowUser(uid, followingId);

    if(result === null || result instanceof GetAccountFriendship){
        response.send({friendship: result, success: true})
    }else{
        response.status(result).send({success: false, friendship: null})
    }
}

/**
 * PUT-Request to accept a follow-request
 */
export const acceptFollowRequest = async (request:Request<unknown, unknown, PutBodyValues>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user
    const followingId: string | undefined = request.query.id as string

    const result = await UserService.acceptFollowRequest(uid, followingId);

    if(result === null || result instanceof GetAccountFriendship){
        response.send({friendship: result, success: true})
    }else{
        response.status(result).send({success: false, friendship: null})
    }
}

/**
 * GET-Request to get all bodyvalues for the signed in user for a specific duration
 */
export const getBodyValues = async (request:Request, response: Response) => {
    const validation = validationResult(request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }
    const duration: number | undefined = +(request.query.duration || 7)
    const uid: string = response.locals.user

    response.send(await UserService.loadBodyValues(uid, duration, undefined))
}


/**
 * PUT-Request to update the calendar of the authenticated user
 */
 export const updateCalendar = async (request:Request<unknown, unknown, {"arr": CalendarTraining[]}>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const calendar = request.body.arr

    response.send({ success: await UserService.updateCalendar(uid, calendar) })
}

/**
 * POST-Request to create a new invitation for a training
 */
 export const inviteUserToCalendarTraining = async (request:Request<{ calendarTrainingId: string}, unknown, unknown>, response: Response, next: NextFunction) => {
    const uid: string = response.locals.user

    const invitedUserId = request.query.invitedUserId as string | undefined
    const calendarTrainingId = request.params.calendarTrainingId

    if(!invitedUserId){
        next()
        return
    }
    const result = await UserService.inviteAccountToCalendarTraining(uid, calendarTrainingId, invitedUserId)
    if (typeof result === 'number')
        response.sendStatus(result)
    else response.send({ success: result })
}

/**
 * POST-Request to accept an invitation for a training
 */
 export const acceptCalendarTrainingInvitation = async (request:Request<{ calendarTrainingId: string}, unknown, unknown>, response: Response) => {
    const uid: string = response.locals.user

    const sendingUserId = request.query.sendingAccountId as string | undefined
    const calendarTrainingId = request.params.calendarTrainingId

    if(!sendingUserId){
        response.sendStatus(422)
        return
    }
    const result = await UserService.acceptCalendarTrainingInvitation(uid, calendarTrainingId, sendingUserId)
    if (typeof result === 'number')
        response.sendStatus(result)
    else {
        const ret = await Promise.all(result.map(async training => {
            let partners = await Promise.all(training.partners.map(async partner => {
                const a = await UserService.loadAccount(partner as string)
                if(a === null)
                    return null
                else return new User(a)
            }))
            partners = partners.filter(partner => partner !== null)

            const t = training
            t.partners = partners as User[]

            return t
        }))
        response.send({
        success: true,
        calendar: ret
    })
}
}




