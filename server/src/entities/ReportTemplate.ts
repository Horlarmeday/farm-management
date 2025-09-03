import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from './BaseEntity';
import { User } from './User';
import { Report } from './Report';

@Entity('report_templates')
export class ReportTemplate extends BaseEntity {
  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100 })
  reportType: string;

  @Column({ type: 'text' })
  queryTemplate: string;

  @Column({ type: 'simple-json', nullable: true })
  defaultParameters?: Record<string, any>;

  @Column({ type: 'simple-json', nullable: true })
  fields?: Record<string, any>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Report, (report) => report.template)
  reports: Report[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @Column({ type: 'varchar', length: 255 })
  createdById: string;
}
