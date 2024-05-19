import { BodyValue } from "../BodyValue"

export class GetStatistics  {
    fat: BodyValue[]
    weight: BodyValue[]
    latestFat: BodyValue | null
    latestWeight: BodyValue | null
    success: boolean
}