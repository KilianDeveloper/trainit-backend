import { BodyValue } from "../models/BodyValue";

export const bodyValueArrayTransformer = {
    to: (data: BodyValue[]) => JSON.stringify(data),
    from: (value: string) => JSON.parse(value) as BodyValue[]
}