import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from "typeorm";
import { UserTrackable } from "./user-trackable.entity";
import { FollowEdge } from "./follow-edge.entity";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ unique: true, length: 50 })
  handle!: string;

  @Column({ name: "display_name", length: 100 })
  displayName!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: "password_hash", length: 255, select: false })
  passwordHash!: string;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @OneToMany(() => UserTrackable, (ut) => ut.user)
  trackables!: UserTrackable[];

  @OneToMany(() => FollowEdge, (fe) => fe.requester)
  followingRequests!: FollowEdge[];

  @OneToMany(() => FollowEdge, (fe) => fe.target)
  followerRequests!: FollowEdge[];
}
