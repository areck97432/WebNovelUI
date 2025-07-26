import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Chapter } from './chapter.entity';

@Entity('novels')
export class Novel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  title: string;

  @Column({ unique: true })
  slug: string;

  @Column({ nullable: true })
  author: string;

  @Column('text', { nullable: true })
  description: string;

  @Column({ name: 'cover_image_url', nullable: true })
  coverImageUrl: string;

  @Column('text', { array: true, nullable: true })
  genre_tags: string[];

  @Column({ name: 'total_chapters', default: 0 })
  totalChapters: number;

  @Column({ type: 'timestamp with time zone', name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => Chapter, chapter => chapter.novel)
  chapters: Chapter[];
}
