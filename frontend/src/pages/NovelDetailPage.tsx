import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getNovel } from '../services/novel.service';
import { Container, Grid, Image, Title, Text, Paper, List, Loader, Alert } from '@mantine/core';

interface Chapter {
  id: number;
  title: string;
  chapterNumber: number;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
  author: string;
  description: string;
  coverImageUrl: string;
  chapters: Chapter[];
}

const NovelDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNovel = async () => {
      try {
        setLoading(true);
        const data = await getNovel(slug as string);
        setNovel(data);
      } catch (err) {
        setError('Failed to fetch novel details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchNovel();
    }
  }, [slug]);

  if (loading) {
    return <Container style={{ textAlign: 'center' }}><Loader /></Container>;
  }

  if (error) {
    return <Container><Alert color="red">{error}</Alert></Container>;
  }

  if (!novel) {
    return <Container><Alert color="yellow">Novel not found.</Alert></Container>;
  }

  return (
    <Container>
      <Grid gutter="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Image src={novel.coverImageUrl || 'https://via.placeholder.com/300x450'} alt={novel.title} radius="md" />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Title order={1}>{novel.title}</Title>
          <Text c="dimmed" mb="md">by {novel.author}</Text>
          <Text mb="lg">{novel.description}</Text>
          <Paper withBorder radius="md" p="md" style={{ maxHeight: 400, overflowY: 'auto' }}>
            <Title order={2} size="h3" mb="sm">Chapters</Title>
            <List spacing="xs">
              {novel.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber).map((chapter) => (
                <List.Item key={chapter.id}>
                  <Link to={`/novels/${novel.slug}/chapter/${chapter.chapterNumber}`}>
                    Chapter {chapter.chapterNumber}: {chapter.title}
                  </Link>
                </List.Item>
              ))}
            </List>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
};

export default NovelDetailPage;
