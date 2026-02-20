import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { UserTrackable } from "./user-trackable.entity";
import type { DailyProgress } from "@meusdesafios/shared";

@Entity("computed_daily_stats")
@Index(["userTrackableId", "day"])
@Unique(["userTrackableId", "day"])
export class ComputedDailyStats {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_trackable_id" })
  userTrackableId!: string;

  @ManyToOne(() => UserTrackable)
  @JoinColumn({ name: "user_trackable_id" })
  userTrackable!: UserTrackable;

  @Column({ type: "date" })
  day!: Date;

  @Column({ name: "progress", type: "jsonb" })
  progress!: DailyProgress;

  @Column({ name: "met_goal" })
  metGoal!: boolean;

  @Column({ name: "points_earned", type: "int" })
  pointsEarned!: number;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
