import { AppDataSource } from "../config/mysql.connector"
import { Account } from "../models/Account"
import { TrainingPlan } from "../models/TrainingPlan"

const repository = AppDataSource.getRepository(TrainingPlan)
const accountRepository = AppDataSource.getRepository(Account)

export const loadTrainingPlansByAccount = async (account: string) => {
    return await repository.findBy({ accountId: account })
}

export const updateOrCreateTrainingPlan = async (trainingPlan: TrainingPlan) => {
    await accountRepository.update({id: trainingPlan.accountId}, {lastModified: new Date()})
    return await repository.save(trainingPlan)
}