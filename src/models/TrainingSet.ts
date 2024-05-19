import { checkProperties } from "../utils/validator";

export class TrainingSet{
    repetitions: number

    constructor() {
        this.repetitions = 1;
    }

    static readonly VALUE_MAX = 100;
    static readonly VALUE_MIN = -1;


    static isValid(value: any) {
        const goal = new TrainingSet();
        checkProperties(value, goal)
        return true;
    }
}