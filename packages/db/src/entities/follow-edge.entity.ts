import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from "typeorm";
import { User } from "./user.entity";
import type { FollowStatus } from "@meusdesafios/shared";

@Entity("follow_edges")
@Index(["requesterId", "targetId", "status"])
@Unique(["requesterId", "targetId"])
export class FollowEdge {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "requester_id" })
  requesterId!: string;

  @ManyToOne(() => User, (user) => user.followingRequests)
  @JoinColumn({ name: "requester_id" })
  requester!: User;

  @Column({ name: "target_id" })
  targetId!: string;

  @ManyToOne(() => User, (user) => user.followerRequests)
  @JoinColumn({ name: "target_id" })
  target!: User;

  @Column({
    type: "enum",
    enum: ["pending", "accepted", "denied", "blocked"],
    default: "pending",
  })
  status!: FollowStatus;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
