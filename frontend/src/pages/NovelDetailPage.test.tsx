import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import NovelDetailPage from './NovelDetailPage';
import * as novelService from '../services/novel.service';
import { vi } from 'vitest';

// Mock the novel service
vi.mock('../services/novel.service');

describe('NovelDetailPage', () => {
  const mockNovel = {
    id: 1,
    title: 'Test Novel',
    slug: 'test-novel',
    author: 'Test Author',
    description: 'This is a test description.',
    coverImageUrl: 'https://via.placeholder.com/150',
    chapters: [
      { id: 1, title: 'Chapter 1', chapterNumber: 1 },
      { id: 2, title: 'Chapter 2', chapterNumber: 2 },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders novel details correctly', async () => {
    (novelService.getNovel as vi.Mock).mockResolvedValue(mockNovel);

    render(
      <MemoryRouter initialEntries={['/novels/test-novel']}>
        <Routes>
          <Route path="/novels/:slug" element={<NovelDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading novel.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Novel')).toBeInTheDocument();
      expect(screen.getByText(/by Test Author/i)).toBeInTheDocument();
      expect(screen.getByText('This is a test description.')).toBeInTheDocument();
      expect(screen.getByText('Chapter 1: Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('Chapter 2: Chapter 2')).toBeInTheDocument();
    });
  });

  it('renders loading state', () => {
    (novelService.getNovel as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    render(
      <MemoryRouter initialEntries={['/novels/test-novel']}>
        <Routes>
          <Route path="/novels/:slug" element={<NovelDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText(/Loading novel.../i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    (novelService.getNovel as vi.Mock).mockRejectedValue(new Error('Network error'));

    render(
      <MemoryRouter initialEntries={['/novels/test-novel']}>
        <Routes>
          <Route path="/novels/:slug" element={<NovelDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch novel details./i)).toBeInTheDocument();
    });
  });

  it('renders novel not found state', async () => {
    (novelService.getNovel as vi.Mock).mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/novels/test-novel']}>
        <Routes>
          <Route path="/novels/:slug" element={<NovelDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Novel not found./i)).toBeInTheDocument();
    });
  });
});