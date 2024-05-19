import { checkExact, checkSchema, query } from "express-validator"
import { Account } from "../models/Account"
import { BodyValue } from "../models/BodyValue"
import { CalendarTraining } from "../models/CalendarTraining"
import { Exercise } from "../models/Exercises"
import { Goal } from "../models/Goal"
import { PersonalRecord } from "../models/PersonalRecord"
import { TrainingSet } from "../models/TrainingSet"

export const validateBody = (method: string) => {
  switch (method) {
    case 'updateUser':
      return checkExact(checkSchema({
        // Base Information
        username: {
          isString: true,
          isLength: {
            options: {
              min: Account.USERNAME_MIN_LENGTH,
              max: Account.USERNAME_MAX_LENGTH
            }
          }
        },
        averageSetDuration: {
          isInt: {
            options: {
              min: Account.REST_MIN_LENGTH,
              max: Account.REST_MAX_LENGTH
            }
          }
        },
        averageSetRestDuration: {
          isInt: {
            options: {
              min: Account.REST_MIN_LENGTH,
              max: Account.REST_MAX_LENGTH
            }
          }
        },
        isPublicProfile: {
          isBoolean: true
        },
        weightUnit: {
          isIn: {
            options: [['kg', 'lbs']],
          }
        },
        // Goals
        goals: {
          isArray: {
            options: {
              min: 0,
              max: Account.GOAL_MAX,
            }
          },
          optional: { options: { nullable: true } }
        },
        "goals.*": {
          isObject: true,
          custom: {
            options: (value) => Goal.isValid(value)
          }
        },
        "goals.*.type": {
          isIn: {
            options: [['p', 'b']]
          }
        },
        "goals.*.name": {
          isString: true,
          isLength: {
            options: {
              min: Goal.NAME_MIN_LENGTH,
              max: Goal.NAME_MAX_LENGTH
            }
          },
          optional: {
            options: {
              nullable: true
            }
          },
        },
        "goals.*.createdOn": {
          isISO8601: true,
        },
        "goals.*.from": {
          isFloat: {
            options: {
              min: 0,
              max: Goal.VALUE_MAX,
            }
          },
        },
        "goals.*.to": {
          isFloat: {
            options: {
              min: 0,
              max: Goal.VALUE_MAX,
            }
          },
        },
        "goals.*.unit": {
          isIn: {
            options: [['s', 'min', 'm', 'cm', 'kg', 'lbs', 'p']]
          }
        },
        "goals.*.isDone": {
          isBoolean: true,
        },

        // Personal Records
        personalRecords: {
          isArray: {
            options: {
              min: 0,
              max: Account.PERSONALRECORD_MAX,
            }
          },
          optional: { options: { nullable: true } }
        },
        "personalRecords.*": {
          isObject: true,
          custom: {
            options: (value) => PersonalRecord.isValid(value)
          }
        },
        "personalRecords.*.isFavorite": {
          isBoolean: true,
        },
        "personalRecords.*.name": {
          isString: true,
          isLength: {
            options: {
              min: PersonalRecord.NAME_MIN_LENGTH,
              max: PersonalRecord.NAME_MAX_LENGTH
            }
          },
        },
        "personalRecords.*.value": {
          isFloat: {
            options: {
              min: PersonalRecord.VALUE_MIN,
              max: PersonalRecord.VALUE_MAX,
            }
          },
        },
        "personalRecords.*.unit": {
          isIn: {
            options: [['s', 'min', 'm', 'cm', 'kg', 'lbs', 'p']]
          }
        },
        "personalRecords.*.date": {
          isISO8601: true
        },
      }))
    case 'putBodyValues':
      return checkExact(checkSchema({
        value: {
          isFloat: {
            options: {
              min: BodyValue.VALUE_MIN,
              max: BodyValue.VALUE_MAX,
            }
          },
        },
        date: {
          isDate: true,
        },
        type: {
          isIn: {
            options: [['w', 'f']]
          }
        },
      }))
    case 'updateStatistics':
      return checkExact(checkSchema({
        // Goals
        goals: {
          isArray: {
            options: {
              min: Account.GOAL_MIN,
              max: Account.GOAL_MAX,
            }
          },
          optional: { options: { nullable: true } }
        },
        "goals.*": {
          isObject: true,
          custom: {
            options: (value) => Goal.isValid(value)
          }
        },
        "goals.*.type": {
          isIn: {
            options: [['p', 'b']]
          }
        },
        "goals.*.name": {
          isString: true,
          isLength: {
            options: {
              min: Goal.NAME_MIN_LENGTH,
              max: Goal.NAME_MAX_LENGTH
            }
          },
          optional: {
            options: {
              nullable: true
            }
          },
        },
        "goals.*.createdOn": {
          isISO8601: true,
        },
        "goals.*.from": {
          isFloat: {
            options: {
              min: Goal.VALUE_MIN,
              max: Goal.VALUE_MAX,
            }
          },
        },
        "goals.*.to": {
          isFloat: {
            options: {
              min: Goal.VALUE_MIN,
              max: Goal.VALUE_MAX,
            }
          },
        },
        "goals.*.unit": {
          isIn: {
            options: [['s', 'min', 'm', 'cm', 'kg', 'lbs', 'p']]
          }
        },
        "goals.*.isDone": {
          isBoolean: true,
        },

        // Personal Records
        personalRecords: {
          isArray: {
            options: {
              min: Account.PERSONALRECORD_MIN,
              max: Account.PERSONALRECORD_MAX,
            }
          },
          optional: { options: { nullable: true } }
        },
        "personalRecords.*": {
          isObject: true,
          custom: {
            options: (value) => PersonalRecord.isValid(value)
          }
        },
        "personalRecords.*.isFavorite": {
          isBoolean: true,
        },
        "personalRecords.*.name": {
          isString: true,
          isLength: {
            options: {
              min: PersonalRecord.NAME_MIN_LENGTH,
              max: PersonalRecord.NAME_MAX_LENGTH
            }
          },
        },
        "personalRecords.*.value": {
          isFloat: {
            options: {
              min: PersonalRecord.VALUE_MIN,
              max: PersonalRecord.VALUE_MAX,
            }
          },
        },
        "personalRecords.*.unit": {
          isIn: {
            options: [['s', 'min', 'm', 'cm', 'kg', 'lbs', 'p']]
          }
        },
        "personalRecords.*.date": {
          isISO8601: true
        },
      }))
    case 'updateCalendar':
      return checkExact(checkSchema({
        "arr": {
          isArray: {
            options: {
              min: Account.CALENDAR_MIN,
              max: Account.CALENDAR_MAX,
            }
          },
        },
        "arr.*": {
          isObject: true,
          custom: {
            options: (value) => CalendarTraining.isValid(value)
          }
        },
        "arr.*.exercises.*": {
          isObject: true,
          custom: {
            options: (value) => Exercise.isValid(value)
          }
        },
        "arr.*.exercises.*.sets.*": {
          isObject: true,
          custom: {
            options: (value) => TrainingSet.isValid(value)
          }
        },
        "arr.*.exercises.*.sets.*.repetitions": {
          isInt: {
            options: {
              max: TrainingSet.VALUE_MAX,
              min: TrainingSet.VALUE_MIN
            }
          },
        },
        "arr.*.exercises.*.id": {
          isUUID: true
        },
        "arr.*.exercises.*.name": {
          isString: true,
          isLength: {
            options: {
              min: Exercise.NAME_MIN_LENGTH,
              max: Exercise.NAME_MAX_LENGTH
            }
          }
        },
        "arr.*.supersetIndexes": {
          isArray: {
            options: {
              min: 0,
              max: 100
            }
          },
        },
        "arr.*.supersetIndexes.*": {
          isInt: true,
        },
        "arr.*.id": {
          isUUID: true
        },
        "arr.*.name": {
          isString: true,
          isLength: {
            options: {
              min: CalendarTraining.NAME_MIN_LENGTH,
              max: CalendarTraining.NAME_MAX_LENGTH
            }
          }
        },
        "arr.*.baseTrainingId": {
          isString: true,
          optional: {
            options: {
              nullable: true
            }
          }
        },
        "arr.*.date": {
          isISO8601: true
        }
      }))
    default: return checkSchema({})

  }
}

export const validateQuery = (method: string) => {
  switch (method) {
    case 'createUser':
      return [
        query('username')
          .isString()
          .trim()
          .isLength({
            min: Account.USERNAME_MIN_LENGTH,
            max: Account.USERNAME_MAX_LENGTH
          }),
      ];
    case 'follow':
      return [
        query('id')
          .isString()
          .trim()
          .isLength({
            min: Account.USERID_MIN_LENGTH,
            max: Account.USERID_MAX_LENGTH
          }),
      ];
    case 'unfollow':
      return [
        query('id')
          .isString()
          .trim()
          .isLength({
            min: Account.USERID_MIN_LENGTH,
            max: Account.USERID_MAX_LENGTH
          }),
      ];
      case 'acceptFollow':
        return [
          query('id')
            .isString()
            .trim()
            .isLength({
              min: Account.USERID_MIN_LENGTH,
              max: Account.USERID_MAX_LENGTH
            }),
        ];
    case 'getBodyValues':
      return [
        query('duration')
          .isInt({
            min: 1,
            max: 500
          }),
      ];
    case 'finishGoal':
      return [
        query('local')
          .isString().trim().isLength({
            min: 3,
            max: 8
          }).optional(),
      ];
    case 'getProfile':
      return [
        query('userId')
          .isString().trim().isLength({
            min: 3,
            max: 8
          }).optional(),
        query('email')
          .isEmail().optional(),
      ];
    default: return []
  }
}