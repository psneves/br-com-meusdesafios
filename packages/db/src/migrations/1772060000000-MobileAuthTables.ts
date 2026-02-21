import { MigrationInterface, QueryRunner } from "typeorm";

export class MobileAuthTables1772060000000 implements MigrationInterface {
    name = 'MobileAuthTables1772060000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add apple_id to users
        await queryRunner.query(`ALTER TABLE "users" ADD "apple_id" character varying UNIQUE`);

        // Create mobile_auth_sessions table
        await queryRunner.query(`
            CREATE TABLE "mobile_auth_sessions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "device_id" character varying(255) NOT NULL,
                "refresh_token_hash" character varying(64) NOT NULL,
                "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "revoked_at" TIMESTAMP WITH TIME ZONE,
                "last_used_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_mobile_auth_sessions" PRIMARY KEY ("id"),
                CONSTRAINT "FK_mobile_auth_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE INDEX "IDX_mobile_auth_sessions_user_device" ON "mobile_auth_sessions" ("user_id", "device_id")`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_mobile_auth_sessions_active_token" ON "mobile_auth_sessions" ("refresh_token_hash") WHERE "revoked_at" IS NULL`);

        // Create mobile_devices table
        await queryRunner.query(`
            CREATE TABLE "mobile_devices" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "device_id" character varying(255) NOT NULL,
                "platform" character varying(20) NOT NULL,
                "app_version" character varying(20),
                "push_token" character varying,
                "last_seen_at" TIMESTAMP WITH TIME ZONE NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_mobile_devices" PRIMARY KEY ("id"),
                CONSTRAINT "FK_mobile_devices_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
            )
        `);

        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_mobile_devices_user_device" ON "mobile_devices" ("user_id", "device_id")`);

        // Create user_notification_preferences table
        await queryRunner.query(`
            CREATE TABLE "user_notification_preferences" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "user_id" uuid NOT NULL,
                "daily_reminder_enabled" boolean NOT NULL DEFAULT true,
                "reminder_time_local" TIME,
                "timezone" character varying(50),
                "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_notification_preferences" PRIMARY KEY ("id"),
                CONSTRAINT "FK_user_notification_preferences_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
                CONSTRAINT "UQ_user_notification_preferences_user" UNIQUE ("user_id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user_notification_preferences"`);
        await queryRunner.query(`DROP INDEX "IDX_mobile_devices_user_device"`);
        await queryRunner.query(`DROP TABLE "mobile_devices"`);
        await queryRunner.query(`DROP INDEX "IDX_mobile_auth_sessions_active_token"`);
        await queryRunner.query(`DROP INDEX "IDX_mobile_auth_sessions_user_device"`);
        await queryRunner.query(`DROP TABLE "mobile_auth_sessions"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "apple_id"`);
    }
}
