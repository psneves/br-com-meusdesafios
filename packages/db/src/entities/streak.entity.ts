import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import { UserTrackable } from "./user-trackable.entity";

@Entity("streaks")
@Unique(["userId", "userTrackableId"])
export class Streak {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "user_trackable_id" })
  userTrackableId!: string;

  @ManyToOne(() => UserTrackable, (ut) => ut.streaks)
  @JoinColumn({ name: "user_trackable_id" })
  userTrackable!: UserTrackable;

  @Column({ name: "current_streak", type: "int", default: 0 })
  currentStreak!: number;

  @Column({ name: "best_streak", type: "int", default: 0 })
  bestStreak!: number;

  @Column({ name: "last_met_day", type: "date", nullable: true })
  lastMetDay?: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
