import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";

@Entity("mobile_devices")
@Index(["userId", "deviceId"], { unique: true })
export class MobileDevice {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "user_id" })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ name: "device_id", type: "varchar", length: 255 })
  deviceId!: string;

  @Column({ type: "varchar", length: 20 })
  platform!: string;

  @Column({ name: "app_version", type: "varchar", length: 20, nullable: true })
  appVersion!: string | null;

  @Column({ name: "push_token", type: "varchar", nullable: true })
  pushToken!: string | null;

  @Column({ name: "last_seen_at", type: "timestamptz" })
  lastSeenAt!: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
