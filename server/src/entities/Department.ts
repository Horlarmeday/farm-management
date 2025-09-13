import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';

@Entity('departments')
export class Department extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  budget?: number;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'manager_id' })
  manager?: User;

  @Column({ type: 'varchar', nullable: true })
  managerId?: string;

  @OneToMany(() => User, (user) => user.department)
  employees!: User[];
}
