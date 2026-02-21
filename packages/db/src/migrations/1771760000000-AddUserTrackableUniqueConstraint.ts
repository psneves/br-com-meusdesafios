import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTrackableUniqueConstraint1771760000000 implements MigrationInterface {
    name = 'AddUserTrackableUniqueConstraint1771760000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Remove duplicate user_trackables keeping only the oldest per (user_id, template_id)
        await queryRunner.query(`
            DELETE FROM user_trackables
            WHERE id NOT IN (
                SELECT DISTINCT ON (user_id, template_id) id
                FROM user_trackables
                ORDER BY user_id, template_id, created_at ASC
            )
        `);

        await queryRunner.query(
            `ALTER TABLE "user_trackables" ADD CONSTRAINT "UQ_user_trackable_user_template" UNIQUE ("user_id", "template_id")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "user_trackables" DROP CONSTRAINT "UQ_user_trackable_user_template"`
        );
    }
}
