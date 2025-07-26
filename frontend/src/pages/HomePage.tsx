import { useEffect, useState } from 'react';
import NovelList from '../components/NovelList';
import { getNovels } from '../services/novel.service';
import { Container, Title } from '@mantine/core';

const HomePage: React.FC = () => {
  const [novels, setNovels] = useState([]);

  useEffect(() => {
    const fetchNovels = async () => {
      const data = await getNovels();
      setNovels(data);
    };

    fetchNovels();
  }, []);

  return (
    <Container>
      <Title order={1} mb="lg">Novels</Title>
      <NovelList novels={novels} />
    </Container>
  );
};

export default HomePage;