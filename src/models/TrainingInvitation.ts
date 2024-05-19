import { Column, Entity, PrimaryColumn } from "typeorm"
import { uuidTransformer } from "../utils/uuidhelper"
import { BaseEntity } from "./BaseEntity"


@Entity("training_invitation")
export class TrainingInvitation implements BaseEntity {
    @PrimaryColumn({name: "invited_account_id"})
    invitedAccountId: string

    @PrimaryColumn({name: "sending_account_id"})
    sendingAccountId: string

    @PrimaryColumn({
        name: "calendar_training_id",
        type: 'binary',
        length: 16,
        generated: false,
        transformer: uuidTransformer,
    })
    calendarTrainingId: string

    @Column({name: "created_on",})
    createdOn: Date

    public hashableString(){
        return this.sendingAccountId + this.calendarTrainingId + this.invitedAccountId
    }
}