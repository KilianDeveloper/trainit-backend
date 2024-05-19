import { Column, Entity, PrimaryColumn } from "typeorm"
import { v4 as uuidv4 } from 'uuid'
import { uuidTransformer } from "../utils/uuidhelper"
import { BaseEntity } from "./BaseEntity"
import { TrainingDays } from "./TrainingDays"

@Entity("training_plan")
export class TrainingPlan implements BaseEntity {
    @PrimaryColumn({
        name: "id",
        type: 'binary',
        length: 16,
        generated: false,
        transformer: uuidTransformer,
    })
    id: string

    @Column({name: "name"})
    name: string

    @Column({name: "days"})
    days: string

    @Column({name: "created_on",})
    createdOn: Date

    @Column({name: "account_id"})
    accountId: string

    public hashableString(){
        return this.id + this.name + this.days.toString() + this.createdOn.toISOString() + this.accountId
    }

    public toMobileVersion(){
        this.days = JSON.parse(this.days)
        return this
    }
    public toDatabaseVersion(){
        this.days = JSON.stringify(this.days)
        return this
    }

    static readonly NAME_MAX_LENGTH = 50;
    static readonly NAME_MIN_LENGTH = 1;

    static newEntity(accountId: string){
        const trainingPlan = new TrainingPlan()
        trainingPlan.id = uuidv4();
        trainingPlan.accountId = accountId
        trainingPlan.createdOn = new Date()
        trainingPlan.name = "Your Training Plan"
        trainingPlan.days = TrainingDays.empty()
        return trainingPlan
    }
}