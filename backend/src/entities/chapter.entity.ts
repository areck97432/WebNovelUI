import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique } from 'typeorm';
import { Novel } from './novel.entity';

@Entity('chapters')
@Unique(['novel', 'chapterNumber'])
export class Chapter {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Novel, novel => novel.chapters, { onDelete: 'CASCADE' })
  novel: Novel;

  @Column({ name: 'chapter_number' })
  chapterNumber: number;

  @Column({ nullable: true })
  title: string;

  @Column('text')
  content: string;

  @Column({ name: 'word_count', nullable: true })
  wordCount: number;

  @Column({ type: 'timestamp with time zone', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
