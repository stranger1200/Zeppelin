import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity("case_snippets")
@Index("IDX_case_snippets_guild_id_name", ["guild_id", "name"], { unique: true })
export class CaseSnippet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  guild_id: string;

  @Column({ length: 100 })
  name: string;

  @Column("text")
  text: string;
}
