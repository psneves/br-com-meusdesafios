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
import { UserTrackable } from "./user-trackable.entity";
import type { LogMeta } from "@challengeos/shared";

@Entity("trackable_logs")
@Index(["userTrackableId", "occurredAt"])
export class TrackableLog {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_trackable_id" })
  userTrackableId!: string;

  @ManyToOne(() => UserTrackable, (ut) => ut.logs)
  @JoinColumn({ name: "user_trackable_id" })
  userTrackable!: UserTrackable;

  @Column({ name: "occurred_at", type: "timestamptz" })
  occurredAt!: Date;

  @Column({ name: "value_num", type: "numeric", nullable: true })
  valueNum?: number;

  @Column({ name: "value_text", type: "text", nullable: true })
  valueText?: string;

  @Column({ name: "meta", type: "jsonb", nullable: true })
  meta?: LogMeta;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
