import { checkProperties } from "../utils/validator"
import { BaseEntity } from "./BaseEntity"
import { Exercise } from "./Exercises"
import { User } from "./User"

export class CalendarTraining implements BaseEntity {
    id: string

    name: string

    exercises: Exercise[]

    baseTrainingId: string | null

    supersetIndexes: number[]

    partners: string[] | User[]

    date: Date

    constructor() {
        this.id = "";
        this.name = "";
        this.exercises = [];
        this.baseTrainingId = null;
        this.supersetIndexes = [];
        this.partners = [];
        this.date = new Date();
    }

    static readonly NAME_MAX_LENGTH = 50;
    static readonly NAME_MIN_LENGTH = 1;

    static isValid(value: any) {
        const goal = new CalendarTraining();
        checkProperties(value, goal)
        return true;
    }

    public hashableString(){
        return this.id + this.name + this.exercises.toString() + (this.baseTrainingId !== null ? this.baseTrainingId : "")
        + this.partners.toString() + this.date.toDateString() + this.supersetIndexes.toString();
    }
}