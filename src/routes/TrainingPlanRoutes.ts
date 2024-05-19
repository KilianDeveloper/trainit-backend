/* eslint-disable @typescript-eslint/no-misused-promises */
import { Router } from 'express';
import { updateTrainingPlan } from '../controllers/TrainingPlanController';
import { authenticationMiddleware } from "../middlewares/authentication";
import { validateBody, validateQuery } from '../validation/TrainingPlanValidation';
export const router = Router();

// Security
router.use("/", authenticationMiddleware)

router.put("/", validateBody("updateTrainingPlan"), validateQuery("updateTrainingPlan"), updateTrainingPlan)

export const TrainingPlanRouter = router