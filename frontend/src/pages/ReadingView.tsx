import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getChapter, getNovel } from '../services/novel.service';
import { useFontSize } from '../contexts/FontSizeContext';
import { Container, Title, Text, Paper, Group, Button, Loader, Alert } from '@mantine/core';

interface Chapter {
  id: number;
  title: string;
  chapterNumber: number;
  content: string;
}

interface Novel {
  totalChapters: number;
}

const ReadingView: React.FC = () => {
  const { slug, chapterNumber } = useParams<{ slug: string; chapterNumber: string }>();
  const navigate = useNavigate();
  const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const currentChapterNum = parseInt(chapterNumber || '1', 10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const chapterData = await getChapter(slug as string, currentChapterNum);
        setChapter(chapterData);

        const novelData = await getNovel(slug as string);
        setNovel(novelData);
      } catch (err) {
        setError('Failed to load chapter.');
        console.error(err);
      }
 finally {
        setLoading(false);
      }
    };

    if (slug && chapterNumber) {
      fetchData();
    }
  }, [slug, chapterNumber, currentChapterNum]);

  const handlePrevious = () => {
    if (currentChapterNum > 1) {
      navigate(`/novels/${slug}/chapter/${currentChapterNum - 1}`);
    }
  };

  const handleNext = () => {
    if (novel && currentChapterNum < novel.totalChapters) {
      navigate(`/novels/${slug}/chapter/${currentChapterNum + 1}`);
    }
  };

  if (loading) {
    return <Container style={{ textAlign: 'center' }}><Loader /></Container>;
  }

  if (error) {
    return <Container><Alert color="red">{error}</Alert></Container>;
  }

  if (!chapter) {
    return <Container><Alert color="yellow">Chapter not found.</Alert></Container>;
  }

  return (
    <Container size="md">
      <Title order={1} ta="center" mb="md">{chapter.title}</Title>
      {novel && (
        <Text c="dimmed" ta="center" mb="md">
          Chapter {currentChapterNum} of {novel.totalChapters}
        </Text>
      )}
      <Group justify="center" mb="md">
        <Button onClick={decreaseFontSize}>A-</Button>
        <Text>{fontSize}px</Text>
        <Button onClick={increaseFontSize}>A+</Button>
      </Group>
      <Paper p="md" style={{ lineHeight: 1.8 }}>
        {chapter.content.split('\n\n').map((paragraph, index) => (
          <Text key={index} mb="md" style={{ fontSize: `${fontSize}px`, textAlign: 'justify' }}>
            {paragraph}
          </Text>
        ))}
      </Paper>
      <Group justify="space-between" mt="md">
        <Button onClick={handlePrevious} disabled={currentChapterNum <= 1}>
          Previous Chapter
        </Button>
        <Button onClick={handleNext} disabled={!novel || currentChapterNum >= novel.totalChapters}>
          Next Chapter
        </Button>
      </Group>
    </Container>
  );
};

export default ReadingView;
