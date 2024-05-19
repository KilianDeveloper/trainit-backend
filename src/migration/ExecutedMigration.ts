import { Column, Entity, PrimaryColumn } from "typeorm"

@Entity("migration")
export class ExecutedMigration {
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @PrimaryColumn()
    fileName: string = ""

    @Column({
        default: () => 'NOW()',
      })
    executedOn: Date = new Date()
}