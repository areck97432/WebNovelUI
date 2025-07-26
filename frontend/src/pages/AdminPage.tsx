import { useState } from 'react';
import axios from 'axios';
import { Container, Title, Paper, Text, Button, Alert } from '@mantine/core';

const AdminPage: React.FC = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanContent = async () => {
    try {
      setMessage(null);
      setError(null);
      const response = await axios.post('http://localhost:3000/api/admin/scan-content');
      setMessage(response.data.message);
    } catch (err) {
      setError('Failed to initiate content scan.');
      console.error(err);
    }
  };

  return (
    <Container>
      <Title order={1} mb="lg">Admin Panel</Title>
      <Paper withBorder p="lg" radius="md">
        <Title order={2} size="h3" mb="sm">Content Ingestion</Title>
        <Text mb="md">Click the button below to scan the 'Books/' directory for new novels and chapters and ingest them into the database.</Text>
        <Button onClick={handleScanContent} color="green">
          Scan for New Content
        </Button>
        {message && <Alert color="green" mt="md">{message}</Alert>}
        {error && <Alert color="red" mt="md">{error}</Alert>}
      </Paper>
    </Container>
  );
};

export default AdminPage;