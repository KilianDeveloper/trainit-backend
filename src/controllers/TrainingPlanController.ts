import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { TrainingPlan } from "../models/TrainingPlan";
import * as TrainingPlanService from "../services/TrainingPlanService";

/**
 * PUT-Request to update a training_plan of the authenticated user. The account_id of the TrainingPlan will be set to the accounts id
 */
 export const updateTrainingPlan = async (request:Request<unknown, unknown, TrainingPlan>, response: Response) => {
    const validation = validationResult(request as Request)
    if(!validation.isEmpty()){
        response.status(422).send({ errors: validation.array() })
        return
    }

    const uid: string = response.locals.user

    const trainingPlan = request.body
    trainingPlan.createdOn = new Date(trainingPlan.createdOn)
    trainingPlan.accountId = uid

    const savedDays = trainingPlan.days;
    trainingPlan.days = JSON.stringify(trainingPlan.days)
    const saved = await TrainingPlanService.updateOrCreateTrainingPlan(trainingPlan)
    trainingPlan.days = savedDays

    response.send({
        success: saved === trainingPlan,
        trainingPlan: saved
    })
}