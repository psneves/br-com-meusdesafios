import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1771455840994 implements MigrationInterface {
    name = 'InitialSchema1771455840994'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."trackable_templates_category_enum" AS ENUM('WATER', 'DIET_CONTROL', 'SLEEP', 'PHYSICAL_EXERCISE')`);
        await queryRunner.query(`CREATE TABLE "trackable_templates" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(50) NOT NULL, "name" character varying(100) NOT NULL, "category" "public"."trackable_templates_category_enum" NOT NULL, "default_goal" jsonb NOT NULL, "default_scoring" jsonb NOT NULL, "description" character varying(500), "icon" character varying(50), CONSTRAINT "UQ_c9f17c8bb3234496a8e56969b5a" UNIQUE ("code"), CONSTRAINT "PK_88e9ad13209e352e460fe5ad25f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "trackable_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "user_trackable_id" uuid NOT NULL, "occurred_at" TIMESTAMP WITH TIME ZONE NOT NULL, "value_num" numeric, "value_text" text, "meta" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_872d1b179bef8911e3c6ab204bc" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_c29db9aa8ffc61998f7c8f497f" ON "trackable_logs" ("user_trackable_id", "occurred_at") `);
        await queryRunner.query(`CREATE TABLE "streaks" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "user_trackable_id" uuid NOT NULL, "current_streak" integer NOT NULL DEFAULT '0', "best_streak" integer NOT NULL DEFAULT '0', "last_met_day" date, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_2e297796ad6fb35ff9b834a4abc" UNIQUE ("user_id", "user_trackable_id"), CONSTRAINT "PK_52547016a1a6409f6e5287ed859" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_trackables" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "template_id" uuid NOT NULL, "goal" jsonb NOT NULL, "schedule" jsonb NOT NULL, "scoring" jsonb NOT NULL, "is_active" boolean NOT NULL DEFAULT true, "start_date" date NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_7533004d0c7d1bc1e7806c35eed" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."follow_edges_status_enum" AS ENUM('pending', 'accepted', 'denied', 'blocked')`);
        await queryRunner.query(`CREATE TABLE "follow_edges" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requester_id" uuid NOT NULL, "target_id" uuid NOT NULL, "status" "public"."follow_edges_status_enum" NOT NULL DEFAULT 'pending', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_3faf8bbee461f8ad7c9ac82f916" UNIQUE ("requester_id", "target_id"), CONSTRAINT "PK_b1dcae4a5a4d425d43e6fe8dd10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_876a1b79a62aa15ed9f4af35f7" ON "follow_edges" ("requester_id", "target_id", "status") `);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "handle" character varying(50) NOT NULL, "display_name" character varying(100) NOT NULL, "email" character varying(255) NOT NULL, "password_hash" character varying(255), "google_id" character varying, "provider" character varying(20), "avatar_url" character varying, "is_active" boolean NOT NULL DEFAULT true, "last_login_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6a7e5f591436179c411f5308a9e" UNIQUE ("handle"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_0bd5012aeb82628e07f6a1be53b" UNIQUE ("google_id"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "computed_daily_stats" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "user_trackable_id" uuid NOT NULL, "day" date NOT NULL, "progress" jsonb NOT NULL, "met_goal" boolean NOT NULL, "points_earned" integer NOT NULL, "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_906d394450f66741b297c2bc4db" UNIQUE ("user_trackable_id", "day"), CONSTRAINT "PK_f627cf7af0bd3c6181db8f31dd5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_906d394450f66741b297c2bc4d" ON "computed_daily_stats" ("user_trackable_id", "day") `);
        await queryRunner.query(`CREATE TYPE "public"."points_ledger_source_enum" AS ENUM('trackable_goal', 'streak_bonus', 'penalty', 'admin')`);
        await queryRunner.query(`CREATE TABLE "points_ledger" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "day" date NOT NULL, "source" "public"."points_ledger_source_enum" NOT NULL, "user_trackable_id" uuid, "points" integer NOT NULL, "reason" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1894c07f712716bfe637e82cc05" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_98a976e6a45046030c0fba73da" ON "points_ledger" ("user_id", "day") `);
        await queryRunner.query(`CREATE TYPE "public"."leaderboard_snapshots_scope_type_enum" AS ENUM('following', 'followers')`);
        await queryRunner.query(`CREATE TABLE "leaderboard_snapshots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "scope_user_id" uuid NOT NULL, "scope_type" "public"."leaderboard_snapshots_scope_type_enum" NOT NULL, "day" date NOT NULL, "rank" integer NOT NULL, "score" integer NOT NULL, "cohort_size" integer NOT NULL, "percentile" numeric(5,2), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_da13dd4f20492c08690d403dfa6" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_510c614432cc2d58ec56018f7b" ON "leaderboard_snapshots" ("scope_user_id", "scope_type", "day") `);
        await queryRunner.query(`ALTER TABLE "trackable_logs" ADD CONSTRAINT "FK_fd4fe22453170f0e40987beb0cd" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "trackable_logs" ADD CONSTRAINT "FK_c4a6498952e09463f03631c7ad2" FOREIGN KEY ("user_trackable_id") REFERENCES "user_trackables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "streaks" ADD CONSTRAINT "FK_7ef06a4f4177b11885dd5fb8b29" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "streaks" ADD CONSTRAINT "FK_1bed342f92b675df9b59168736b" FOREIGN KEY ("user_trackable_id") REFERENCES "user_trackables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_trackables" ADD CONSTRAINT "FK_b895e7d0c1b9e8ef458dc709ecc" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_trackables" ADD CONSTRAINT "FK_8184e089797d7978284073349ee" FOREIGN KEY ("template_id") REFERENCES "trackable_templates"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow_edges" ADD CONSTRAINT "FK_7f180f95dd6c2c9b804b1cb1b5d" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "follow_edges" ADD CONSTRAINT "FK_2e54f7a9038fb1db0de6f56b2a1" FOREIGN KEY ("target_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "computed_daily_stats" ADD CONSTRAINT "FK_ea16cc69e870112d028f11ca18d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "computed_daily_stats" ADD CONSTRAINT "FK_ac7650b8e9e379e1d0a9329f69b" FOREIGN KEY ("user_trackable_id") REFERENCES "user_trackables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "points_ledger" ADD CONSTRAINT "FK_da695f16d02317721eb76711fec" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "points_ledger" ADD CONSTRAINT "FK_9b2a47d72db0ff367ac26bdfc25" FOREIGN KEY ("user_trackable_id") REFERENCES "user_trackables"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "leaderboard_snapshots" ADD CONSTRAINT "FK_4f0c6f6d5f0dc43ae27d44c947f" FOREIGN KEY ("scope_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "leaderboard_snapshots" DROP CONSTRAINT "FK_4f0c6f6d5f0dc43ae27d44c947f"`);
        await queryRunner.query(`ALTER TABLE "points_ledger" DROP CONSTRAINT "FK_9b2a47d72db0ff367ac26bdfc25"`);
        await queryRunner.query(`ALTER TABLE "points_ledger" DROP CONSTRAINT "FK_da695f16d02317721eb76711fec"`);
        await queryRunner.query(`ALTER TABLE "computed_daily_stats" DROP CONSTRAINT "FK_ac7650b8e9e379e1d0a9329f69b"`);
        await queryRunner.query(`ALTER TABLE "computed_daily_stats" DROP CONSTRAINT "FK_ea16cc69e870112d028f11ca18d"`);
        await queryRunner.query(`ALTER TABLE "follow_edges" DROP CONSTRAINT "FK_2e54f7a9038fb1db0de6f56b2a1"`);
        await queryRunner.query(`ALTER TABLE "follow_edges" DROP CONSTRAINT "FK_7f180f95dd6c2c9b804b1cb1b5d"`);
        await queryRunner.query(`ALTER TABLE "user_trackables" DROP CONSTRAINT "FK_8184e089797d7978284073349ee"`);
        await queryRunner.query(`ALTER TABLE "user_trackables" DROP CONSTRAINT "FK_b895e7d0c1b9e8ef458dc709ecc"`);
        await queryRunner.query(`ALTER TABLE "streaks" DROP CONSTRAINT "FK_1bed342f92b675df9b59168736b"`);
        await queryRunner.query(`ALTER TABLE "streaks" DROP CONSTRAINT "FK_7ef06a4f4177b11885dd5fb8b29"`);
        await queryRunner.query(`ALTER TABLE "trackable_logs" DROP CONSTRAINT "FK_c4a6498952e09463f03631c7ad2"`);
        await queryRunner.query(`ALTER TABLE "trackable_logs" DROP CONSTRAINT "FK_fd4fe22453170f0e40987beb0cd"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_510c614432cc2d58ec56018f7b"`);
        await queryRunner.query(`DROP TABLE "leaderboard_snapshots"`);
        await queryRunner.query(`DROP TYPE "public"."leaderboard_snapshots_scope_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_98a976e6a45046030c0fba73da"`);
        await queryRunner.query(`DROP TABLE "points_ledger"`);
        await queryRunner.query(`DROP TYPE "public"."points_ledger_source_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_906d394450f66741b297c2bc4d"`);
        await queryRunner.query(`DROP TABLE "computed_daily_stats"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_876a1b79a62aa15ed9f4af35f7"`);
        await queryRunner.query(`DROP TABLE "follow_edges"`);
        await queryRunner.query(`DROP TYPE "public"."follow_edges_status_enum"`);
        await queryRunner.query(`DROP TABLE "user_trackables"`);
        await queryRunner.query(`DROP TABLE "streaks"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c29db9aa8ffc61998f7c8f497f"`);
        await queryRunner.query(`DROP TABLE "trackable_logs"`);
        await queryRunner.query(`DROP TABLE "trackable_templates"`);
        await queryRunner.query(`DROP TYPE "public"."trackable_templates_category_enum"`);
    }

}
