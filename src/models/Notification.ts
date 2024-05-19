import { BaseEntity } from "./BaseEntity";

enum NotificationType{
    d
}

export class Notification implements BaseEntity {
    type: NotificationType
    data: string
    importance: number

    public hashableString(){
        return this.type.toString() + this.data + this.importance.toString()
    }
}