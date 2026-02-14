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
import type { PointSource } from "@challengeos/shared";

@Entity("points_ledger")
@Index(["userId", "day"])
export class PointsLedger {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "date" })
  day!: Date;

  @Column({
    type: "enum",
    enum: ["trackable_goal", "streak_bonus", "penalty", "admin"],
  })
  source!: PointSource;

  @Column({ name: "user_trackable_id", nullable: true })
  userTrackableId?: string;

  @ManyToOne(() => UserTrackable, { nullable: true })
  @JoinColumn({ name: "user_trackable_id" })
  userTrackable?: UserTrackable;

  @Column({ type: "int" })
  points!: number;

  @Column({ type: "text" })
  reason!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
