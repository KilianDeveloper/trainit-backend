import { checkSchema } from "express-validator"
import { Exercise } from "../models/Exercises"
import { Training } from "../models/Training"
import { TrainingPlan } from "../models/TrainingPlan"
import { TrainingSet } from "../models/TrainingSet"

export const validateBody = (method: string) => {
    switch (method) {
        case 'updateTrainingPlan':
            return checkSchema({
                "id": {
                    isUUID: true
                },
                "name": {
                    isString: true,
                    isLength: {
                        options: {
                            min: TrainingPlan.NAME_MIN_LENGTH,
                            max: TrainingPlan.NAME_MAX_LENGTH
                        }
                    }
                },
                "createdOn": {
                    isDate: true
                },
                "days.*": {
                    isArray: { options: { max: 7 }, },
                },
                "days.*.*": {
                    isObject: true,
                    custom: { options: (value) => Training.isValid(value) }
                },
                "days.*.*.id": {
                    isUUID: true
                },
                "days.*.*.name": {
                    isString: true,
                    isLength: {
                        options: {
                            min: Training.NAME_MIN_LENGTH,
                            max: Training.NAME_MAX_LENGTH
                        }
                    }
                },
                "days.*.*.exercises": {
                    isArray: true
                },
                "days.*.*.exercises.*": {
                    isObject: true,
                    custom: {
                        options: (value) => Exercise.isValid(value)
                    }
                },
                "days.*.*.exercises.*.sets.*.repetitions": {
                    isInt: {
                        options: {
                            min: TrainingSet.VALUE_MIN,
                            max: TrainingSet.VALUE_MAX,
                        },
                    },
                },
                "days.*.*.supersetIndexes": {
                    isArray: true
                },
                "days.*.*.supersetIndexes.*": {
                    isInt: true
                },
                "days.*.*.exercises.*.id": {
                    isUUID: true
                },
                "days.*.*.exercises.*.name": {
                    isString: true,
                    isLength: {
                        options: {
                            min: Exercise.NAME_MIN_LENGTH,
                            max: Exercise.NAME_MAX_LENGTH
                        }
                    }
                },
            })
        default: return checkSchema({})

    }
}

export const validateQuery = (method: string) => {
    switch (method) {
        default: return []
    }
}