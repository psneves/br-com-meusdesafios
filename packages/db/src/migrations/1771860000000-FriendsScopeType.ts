import { MigrationInterface, QueryRunner } from "typeorm";

export class FriendsScopeType1771860000000 implements MigrationInterface {
  name = "FriendsScopeType1771860000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."leaderboard_snapshots_scope_type_enum" ADD VALUE IF NOT EXISTS 'friends'`
    );
    await queryRunner.query(
      `UPDATE "leaderboard_snapshots" SET "scope_type" = 'friends' WHERE "scope_type" IN ('following', 'followers')`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "leaderboard_snapshots" SET "scope_type" = 'following' WHERE "scope_type" = 'friends'`
    );
  }
}
