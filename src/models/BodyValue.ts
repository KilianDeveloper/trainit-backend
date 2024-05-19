import { BaseEntity } from "./BaseEntity";

export class BodyValue implements BaseEntity {
    date: Date
    value: number

    static readonly VALUE_MIN = 0;
    static readonly VALUE_MAX = 100000;

    public hashableString(){
        return this.date.toDateString() + this.value.toString()
    }
}