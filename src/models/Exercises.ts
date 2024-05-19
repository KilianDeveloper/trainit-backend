import { checkProperties } from "../utils/validator"
import { BaseEntity } from "./BaseEntity"
import { TrainingSet } from "./TrainingSet"

export class Exercise implements BaseEntity {
    id: string
    name: string
    sets: TrainingSet[]

    public hashableString(){
        return this.id + this.name + this.sets.toString()
    }

    constructor() {
        this.id = "";
        this.name = "";
        this.sets = [];
    }

    static readonly NAME_MAX_LENGTH = 50;
    static readonly NAME_MIN_LENGTH = 1;

    static isValid(value: any) {
        const goal = new Exercise();
        checkProperties(value, goal)
        return true;
    }

    static empty(){
        return '{"friday": [], "monday": [], "sunday": [], "tuesday": [], "saturday": [], "thursday": [], "wednesday": []}'
    }
}