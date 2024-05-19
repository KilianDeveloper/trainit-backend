import { Goal } from "../models/Goal";

export const goalArrayTransformer = {
    to: (data: Goal[]) => JSON.stringify(data),
    from: (value: string) => JSON.parse(value) as Goal[]
}