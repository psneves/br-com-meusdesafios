import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { TrackableTemplate } from "./trackable-template.entity";
import { TrackableLog } from "./trackable-log.entity";
import { Streak } from "./streak.entity";
import type { Goal, Schedule, ScoringConfig } from "@meusdesafios/shared";

@Entity("user_trackables")
export class UserTrackable {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User, (user) => user.trackables)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "template_id" })
  templateId!: string;

  @ManyToOne(() => TrackableTemplate, (template) => template.userTrackables)
  @JoinColumn({ name: "template_id" })
  template!: TrackableTemplate;

  @Column({ name: "goal", type: "jsonb" })
  goal!: Goal;

  @Column({ name: "schedule", type: "jsonb" })
  schedule!: Schedule;

  @Column({ name: "scoring", type: "jsonb" })
  scoring!: ScoringConfig;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "start_date", type: "date" })
  startDate!: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => TrackableLog, (log) => log.userTrackable)
  logs!: TrackableLog[];

  @OneToMany(() => Streak, (streak) => streak.userTrackable)
  streaks!: Streak[];
}
