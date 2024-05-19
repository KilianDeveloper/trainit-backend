import { BaseEntity } from "./BaseEntity"

export class TrainingDays implements BaseEntity {

    public hashableString(){
        return ""
    }

    static empty(){
        return '{"friday": [], "monday": [], "sunday": [], "tuesday": [], "saturday": [], "thursday": [], "wednesday": []}'
    }
}