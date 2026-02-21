import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTrackableUniqueConstraint1771760000000 implements MigrationInterface {
    name = 'AddUserTrackableUniqueConstraint1771760000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Identify duplicate user_trackable IDs (keep the oldest per user_id + template_id)
        const duplicateSubquery = `
            SELECT id FROM user_trackables
            WHERE id NOT IN (
                SELECT DISTINCT ON (user_id, template_id) id
                FROM user_trackables
                ORDER BY user_id, template_id, created_at ASC
            )
        `;

        // Delete dependent rows from all FK-referencing tables before removing duplicates
        await queryRunner.query(`DELETE FROM computed_daily_stats WHERE user_trackable_id IN (${duplicateSubquery})`);
        await queryRunner.query(`DELETE FROM trackable_logs WHERE user_trackable_id IN (${duplicateSubquery})`);
        await queryRunner.query(`DELETE FROM streaks WHERE user_trackable_id IN (${duplicateSubquery})`);
        await queryRunner.query(`DELETE FROM points_ledger WHERE user_trackable_id IN (${duplicateSubquery})`);

        // Now safe to remove duplicate user_trackables
        await queryRunner.query(`DELETE FROM user_trackables WHERE id IN (${duplicateSubquery})`);

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
