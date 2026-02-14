import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
} from "typeorm";
import { UserTrackable } from "./user-trackable.entity";
import type { Goal, ScoringConfig, TrackableCategory } from "@meusdesafios/shared";

@Entity("trackable_templates")
export class TrackableTemplate {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 50 })
  code!: string;

  @Column({ length: 100 })
  name!: string;

  @Column({
    type: "enum",
    enum: ["WATER", "DIET_CONTROL", "SLEEP", "PHYSICAL_EXERCISE"],
  })
  category!: TrackableCategory;

  @Column({ name: "default_goal", type: "jsonb" })
  defaultGoal!: Goal;

  @Column({ name: "default_scoring", type: "jsonb" })
  defaultScoring!: ScoringConfig;

  @Column({ length: 500, nullable: true })
  description?: string;

  @Column({ length: 50, nullable: true })
  icon?: string;

  @OneToMany(() => UserTrackable, (ut) => ut.template)
  userTrackables!: UserTrackable[];
}
