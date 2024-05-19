import { checkProperties } from "../utils/validator"
import { BaseEntity } from "./BaseEntity"
import { Exercise } from "./Exercises"

export class Training implements BaseEntity {
    id: string

    name: string

    exercises: Exercise[]

    supersetIndexes: number[]

    constructor() {
        this.id = "";
        this.name = "";
        this.exercises = [];
        this.supersetIndexes = [];
    }

    static isValid(value: any) {
        const training = new Training();
        checkProperties(value, training)
        return true;
    }

    static readonly NAME_MAX_LENGTH = 50;
    static readonly NAME_MIN_LENGTH = 1;

    public hashableString(){
        return this.id + this.name + this.exercises.toString()+ this.supersetIndexes.toString();
    }
}