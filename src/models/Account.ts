import { Column, Entity, PrimaryColumn } from "typeorm"
import { goalArrayTransformer } from "../utils/goalTransformer"
import { notificationArrayTransformer } from "../utils/notificationTransformaer"
import { bodyValueArrayTransformer } from "../utils/numberTransformer"
import { personalRecordArrayTransformer } from "../utils/personalRecordTransformer"
import { uuidTransformer } from "../utils/uuidhelper"
import { BaseEntity } from "./BaseEntity"
import { BodyValue } from "./BodyValue"
import { CalendarTraining } from "./CalendarTraining"
import { Goal } from "./Goal"
import { PersonalRecord } from "./PersonalRecord"
import { WeightUnit } from "./WeightUnit"

@Entity("account")
export class Account implements BaseEntity {
    @PrimaryColumn({name: "id"})
    id: string

    @Column({name: "username"})
    username: string

    @Column({name: "is_profile_public"})
    isPublicProfile: boolean

    @Column({
        name: "weight_unit",
        type: "enum",
        enum: WeightUnit,
        default: WeightUnit.KG
    })
    weightUnit: WeightUnit

    @Column({name: "average_set_duration"})
    averageSetDuration: number

    @Column({name: "average_set_rest_duration"})
    averageSetRestDuration: number

    @Column({
        name: "training_plan_id",
        type: 'binary',
        length: 16,
        generated: false,
        transformer: uuidTransformer,
    })
    trainingPlanId: string

    @Column({
        name: "personal_records",
        type: "varchar",
        generated: false,
        transformer: personalRecordArrayTransformer,
    })
    personalRecords: PersonalRecord[]

    @Column({
        name: "calendar_trainings",
        type: "varchar",
        generated: false,
        transformer: personalRecordArrayTransformer,
    })
    calendarTrainings: CalendarTraining[]

    @Column({
        name: "goals",
        type: "varchar",
        generated: false,
        transformer: goalArrayTransformer,
    })
    goals: Goal[]

    @Column({
        name: "body_fat",
        type: "varchar",
        generated: false,
        transformer: bodyValueArrayTransformer,
    })
    bodyFat: BodyValue[]

    @Column({
        name: "notifications",
        type: "varchar",
        generated: false,
        transformer: notificationArrayTransformer,
    })
    notifications: Notification[]

    @Column({
        name: "body_weight",
        type: "varchar",
        generated: false,
        transformer: bodyValueArrayTransformer,
    })
    bodyWeight: BodyValue[]

    @Column({name: "last_modified",})
    lastModified: Date

    static readonly USERID_MAX_LENGTH = 128;
    static readonly USERID_MIN_LENGTH = 1;
    static readonly USERNAME_MAX_LENGTH = 50;
    static readonly USERNAME_MIN_LENGTH = 1;
    static readonly REST_MAX_LENGTH = 600;
    static readonly REST_MIN_LENGTH = 1;
    static readonly GOAL_MAX = 1;
    static readonly GOAL_MIN = 0;
    static readonly PERSONALRECORD_MIN = 0;
    static readonly PERSONALRECORD_MAX = 10;
    static readonly CALENDAR_MAX = 20;
    static readonly CALENDAR_MIN = 0;


    public hashableString(){
        return this.id + this.username + this.isPublicProfile.toString()
        + this.averageSetDuration.toString() + this.averageSetRestDuration.toString() + this.trainingPlanId + this.notifications.toString()
    }

    static newEntity(id: string, username: string){
        const account = new Account()
        account.id = id
        account.username = username
        account.averageSetDuration = 90
        account.averageSetRestDuration = 90
        account.isPublicProfile = true
        account.weightUnit = WeightUnit.KG
        account.personalRecords = []
        account.calendarTrainings = []
        account.lastModified = new Date()
        account.notifications = []
        return account
    }
}