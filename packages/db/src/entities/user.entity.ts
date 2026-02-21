import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
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

  @Column({ name: "first_name", length: 50, default: "" })
  firstName!: string;

  @Column({ name: "last_name", length: 50, default: "" })
  lastName!: string;

  @Column({ name: "display_name", length: 100 })
  displayName!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: "password_hash", type: "varchar", length: 255, nullable: true, select: false })
  passwordHash!: string | null;

  @Column({ name: "google_id", type: "varchar", unique: true, nullable: true })
  googleId!: string | null;

  @Column({ name: "apple_id", type: "varchar", unique: true, nullable: true })
  appleId!: string | null;

  @Column({ type: "varchar", nullable: true, length: 20 })
  provider!: string | null;

  @Column({ name: "avatar_url", type: "varchar", nullable: true })
  avatarUrl!: string | null;

  @Column({ name: "location_cell", type: "varchar", length: 12, nullable: true })
  locationCell!: string | null;

  @Column({ name: "location_updated_at", type: "timestamptz", nullable: true })
  locationUpdatedAt!: Date | null;

  @Column({ name: "is_active", default: true })
  isActive!: boolean;

  @Column({ name: "last_login_at", type: "timestamptz", nullable: true })
  lastLoginAt!: Date | null;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;

  @OneToMany(() => UserTrackable, (ut) => ut.user)
  trackables!: UserTrackable[];

  @OneToMany(() => FollowEdge, (fe) => fe.requester)
  followingRequests!: FollowEdge[];

  @OneToMany(() => FollowEdge, (fe) => fe.target)
  followerRequests!: FollowEdge[];
}
