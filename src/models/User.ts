import { Account } from "./Account"
import { BaseEntity } from "./BaseEntity"
import { WeightUnit } from "./WeightUnit"

export class User implements BaseEntity{
    id: string

    username: string

    isPublicProfile: boolean

    weightUnit: WeightUnit

    averageSetDuration: number

    averageSetRestDuration: number

    trainingPlanId: string

    constructor(account: Account){
        this.id = account.id
        this.username = account.username
        this.weightUnit = account.weightUnit
        this.averageSetDuration = account.averageSetDuration
        this.averageSetRestDuration = account.averageSetRestDuration
        this.trainingPlanId = account.trainingPlanId
    }
    public hashableString(): string {
        return this.id + this.username + this.isPublicProfile.toString() + this.averageSetDuration.toString()
        + this.averageSetRestDuration.toString() + this.trainingPlanId
    }
}