import { UserStatus } from '@kuyash/shared';
import * as bcrypt from 'bcryptjs';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Animal } from './Animal';
import { Asset } from './Asset';
import { AttendanceRecord } from './AttendanceRecord';
import { BaseEntity } from './BaseEntity';
import { BirdBatch } from './BirdBatch';
import { Department } from './Department';
import { FinancialTransaction } from './FinancialTransaction';
import { InventoryTransaction } from './InventoryTransaction';
import { Invoice } from './Invoice';
import { Notification } from './Notification';
import { PayrollRecord } from './PayrollRecord';
import { Role } from './Role';
import { Task } from './Task';
import { FarmUser } from './FarmUser';

@Entity('users')
export class User extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  firstName!: string;

  @Column({ type: 'varchar', length: 255 })
  lastName!: string;

  @Column({ type: 'varchar', length: 320, unique: true })
  @Index('IDX_USER_EMAIL')
  email!: string;

  @Column({ type: 'varchar', length: 100, unique: true, nullable: true })
  username?: string;

  @Column({ type: 'varchar', length: 255, select: false })
  password!: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string;

  @Column({ type: 'text', nullable: true })
  avatar?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  employeeId?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  salary?: number;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ type: 'boolean', default: false })
  isOnline!: boolean;

  @Column({ type: 'boolean', default: false })
  isEmailVerified!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  emailVerificationToken?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken?: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires?: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt?: Date;

  @Column({ type: 'varchar', length: 45, nullable: true })
  lastLoginIp?: string;

  @Column({ type: 'text', nullable: true })
  refreshToken?: string | null;

  @Column({ type: 'simple-array', nullable: true })
  twoFactorBackupCodes?: string[];

  @Column({ type: 'boolean', default: false })
  isTwoFactorEnabled!: boolean;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twoFactorSecret?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'varchar', length: 10, nullable: true })
  gender?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  state?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode?: string;

  @Column({ type: 'date', nullable: true })
  hireDate?: Date;

  @Column({ type: 'date', nullable: true })
  terminationDate?: Date;

  @Column({ type: 'text', nullable: true })
  emergencyContact?: string;

  @Column({ type: 'simple-json', nullable: true })
  preferences?: Record<string, any>;

  // Relationships
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'roleId' })
  role!: Role;

  @Column({ type: 'varchar', length: 255 })
  roleId!: string;

  @ManyToOne(() => Department, (department) => department.employees, { nullable: true })
  @JoinColumn({ name: 'departmentId' })
  department?: Department;

  @Column({ type: 'varchar', length: 255, nullable: true })
  departmentId?: string;

  @OneToMany(() => AttendanceRecord, (attendanceRecord) => attendanceRecord.user)
  attendanceRecords!: AttendanceRecord[];

  @OneToMany(() => PayrollRecord, (payrollRecord) => payrollRecord.user)
  payrollRecords!: PayrollRecord[];

  @OneToMany(() => BirdBatch, (birdBatch) => birdBatch.assignedUser)
  assignedBirdBatches!: BirdBatch[];

  @OneToMany(() => Animal, (animal) => animal.assignedUser)
  assignedAnimals!: Animal[];

  @OneToMany(() => Task, (task) => task.assignedUser)
  assignedTasks!: Task[];

  @OneToMany(() => Task, (task) => task.createdBy)
  createdTasks!: Task[];

  @OneToMany(() => InventoryTransaction, (transaction) => transaction.user)
  inventoryTransactions!: InventoryTransaction[];

  @OneToMany(() => FinancialTransaction, (transaction) => transaction.user)
  financialTransactions!: FinancialTransaction[];

  @OneToMany(() => Asset, (asset) => asset.assignedUser)
  assignedAssets!: Asset[];

  @OneToMany(() => Invoice, (invoice) => invoice.createdBy)
  createdInvoices!: Invoice[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Notification, (notification) => notification.createdBy)
  createdNotifications!: Notification[];

  @OneToMany(() => FarmUser, (farmUser) => farmUser.user)
  farmUsers!: FarmUser[];

  // Computed properties
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  // Hash password before saving
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  @BeforeUpdate()
  async hashPasswordOnUpdate() {
    // Only hash if password has actually changed
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 12);
    }
  }

  // Method to compare passwords
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
  }

  // Method to generate password reset token
  generatePasswordResetToken(): string {
    const token =
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    this.passwordResetToken = token;
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    return token;
  }

  // Method to clear password reset token
  clearPasswordResetToken(): void {
    this.passwordResetToken = undefined;
    this.passwordResetExpires = undefined;
  }
}
