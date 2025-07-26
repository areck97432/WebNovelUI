import { Card, Grid, Image, Text } from '@mantine/core';
import { Link } from 'react-router-dom';

interface Novel {
  id: number;
  title: string;
  slug: string;
  author: string;
  coverImageUrl: string;
}

interface NovelListProps {
  novels: Novel[];
}

const NovelList: React.FC<NovelListProps> = ({ novels }) => {
  return (
    <Grid>
      {novels.map((novel) => (
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }} key={novel.id}>
          <Link to={`/novels/${novel.slug}`} style={{ textDecoration: 'none' }}>
            <Card shadow="sm" padding="lg" radius="md" withBorder>
              <Card.Section>
                <Image
                  src={novel.coverImageUrl || 'https://via.placeholder.com/150'}
                  height={300}
                  alt={novel.title}
                />
              </Card.Section>

              <Text fw={500} size="lg" mt="md">
                {novel.title}
              </Text>

              <Text mt="xs" c="dimmed" size="sm">
                {novel.author}
              </Text>
            </Card>
          </Link>
        </Grid.Col>
      ))}
    </Grid>
  );
};

export default NovelList;