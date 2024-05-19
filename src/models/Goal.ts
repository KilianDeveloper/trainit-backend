import { checkProperties } from "../utils/validator"
import { BaseEntity } from "./BaseEntity"
import { GoalType } from "./GoalType"
import { MeasurementUnit } from "./PersonalRecord"

export class Goal implements BaseEntity {
    id: string
    type: GoalType
    name: string | null
    createdOn: Date
    from: number
    to: number
    unit: MeasurementUnit
    isDone: boolean

    constructor() {
        this.id = "";
        this.type = GoalType.BODYVALUE;
        this.createdOn = new Date();
        this.name = null;
        this.from = 0;
        this.to = 1;
        this.unit = MeasurementUnit.KILOGRAM;
        this.isDone = false;
    }

    static isValid(value: any) {
        const goal = new Goal();
        checkProperties(value, goal)
        return true;
    }

    static readonly NAME_MAX_LENGTH = 50;
    static readonly NAME_MIN_LENGTH = 1;
    static readonly VALUE_MAX = 100000;
    static readonly VALUE_MIN = 0;



    public hashableString() {
        return this.type.toString() + (this.name == null ? "" : this.name) + this.unit.toString() + this.createdOn.toDateString() + this.from.toString() + this.to.toString() + this.isDone.toString()
    }
}