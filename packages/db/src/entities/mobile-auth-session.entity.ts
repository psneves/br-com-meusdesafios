import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";

@Entity("mobile_auth_sessions")
@Index(["userId", "deviceId"])
export class MobileAuthSession {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "device_id", type: "varchar", length: 255 })
  deviceId!: string;

  @Column({ name: "refresh_token_hash", type: "varchar", length: 64 })
  refreshTokenHash!: string;

  @Column({ name: "expires_at", type: "timestamptz" })
  expiresAt!: Date;

  @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
  revokedAt!: Date | null;

  @Column({ name: "last_used_at", type: "timestamptz" })
  lastUsedAt!: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
