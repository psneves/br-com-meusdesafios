import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserLocation1771660000000 implements MigrationInterface {
    name = 'AddUserLocation1771660000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "latitude" double precision`);
        await queryRunner.query(`ALTER TABLE "users" ADD "longitude" double precision`);
        await queryRunner.query(`ALTER TABLE "users" ADD "location_updated_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "location_updated_at"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "longitude"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "latitude"`);
    }
}
