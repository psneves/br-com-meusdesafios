import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserDateOfBirth1772160000000 implements MigrationInterface {
  name = "AddUserDateOfBirth1772160000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "date_of_birth" date`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "date_of_birth"`
    );
  }
}
