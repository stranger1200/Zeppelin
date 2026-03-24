import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateCaseSnippetsTable1742774400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: "case_snippets",
        columns: [
          {
            name: "id",
            type: "int",
            unsigned: true,
            isPrimary: true,
            isGenerated: true,
            generationStrategy: "increment",
          },
          {
            name: "guild_id",
            type: "bigint",
            unsigned: true,
          },
          {
            name: "name",
            type: "varchar",
            length: "100",
          },
          {
            name: "text",
            type: "text",
          },
        ],
        indices: [
          {
            name: "IDX_case_snippets_guild_id_name",
            columnNames: ["guild_id", "name"],
            isUnique: true,
          },
        ],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("case_snippets", true);
  }
}
