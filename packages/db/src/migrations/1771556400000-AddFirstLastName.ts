import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFirstLastName1771556400000 implements MigrationInterface {
    name = 'AddFirstLastName1771556400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add first_name and last_name columns with defaults
        await queryRunner.query(`ALTER TABLE "users" ADD "first_name" character varying(50) NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "users" ADD "last_name" character varying(50) NOT NULL DEFAULT ''`);

        // Backfill from display_name: first word → first_name, rest → last_name
        await queryRunner.query(`
            UPDATE "users"
            SET
                "first_name" = CASE
                    WHEN "display_name" IS NULL OR "display_name" = '' THEN ''
                    WHEN position(' ' in "display_name") > 0 THEN left("display_name", position(' ' in "display_name") - 1)
                    ELSE "display_name"
                END,
                "last_name" = CASE
                    WHEN "display_name" IS NULL OR "display_name" = '' THEN ''
                    WHEN position(' ' in "display_name") > 0 THEN substring("display_name" from position(' ' in "display_name") + 1)
                    ELSE ''
                END
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_name"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "first_name"`);
    }
}
