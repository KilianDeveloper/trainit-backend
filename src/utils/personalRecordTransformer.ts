import { PersonalRecord } from "../models/PersonalRecord";

export const personalRecordArrayTransformer = {
    to: (data: PersonalRecord[]) => JSON.stringify(data),
    from: (value: string) => JSON.parse(value) as PersonalRecord[]
}