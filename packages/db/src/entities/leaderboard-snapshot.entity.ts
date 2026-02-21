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

@Entity("leaderboard_snapshots")
@Index(["scopeUserId", "scopeType", "day"])
export class LeaderboardSnapshot {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "scope_user_id" })
  scopeUserId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "scope_user_id" })
  scopeUser!: User;

  @Column({
    name: "scope_type",
    type: "enum",
    enum: ["friends"],
  })
  scopeType!: "friends";

  @Column({ type: "date" })
  day!: Date;

  @Column({ type: "int" })
  rank!: number;

  @Column({ type: "int" })
  score!: number;

  @Column({ name: "cohort_size", type: "int" })
  cohortSize!: number;

  @Column({ type: "numeric", precision: 5, scale: 2, nullable: true })
  percentile?: number;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;
}
