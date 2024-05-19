import { CalendarTraining } from "../models/CalendarTraining";

export const personalRecordArrayTransformer = {
    to: (data: CalendarTraining[]) => JSON.stringify(data),
    from: (value: string) => JSON.parse(value) as CalendarTraining[]
}