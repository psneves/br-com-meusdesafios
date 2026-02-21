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

@Entity("user_notification_preferences")
@Unique(["userId"])
export class UserNotificationPreference {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "daily_reminder_enabled", type: "boolean", default: true })
  dailyReminderEnabled!: boolean;

  @Column({ name: "reminder_time_local", type: "time", nullable: true })
  reminderTimeLocal!: string | null;

  @Column({ type: "varchar", length: 50, nullable: true })
  timezone!: string | null;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
