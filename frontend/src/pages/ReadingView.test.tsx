import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ReadingView from './ReadingView';
import * as novelService from '../services/novel.service';
import { vi } from 'vitest';
import { FontSizeProvider } from '../contexts/FontSizeContext';

// Mock the novel service
vi.mock('../services/novel.service');

describe('ReadingView', () => {
  const mockChapter = {
    id: 1,
    title: 'Test Chapter 1',
    chapterNumber: 1,
    content: 'This is the content of test chapter 1.',
  };

  const mockNovel = {
    totalChapters: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderReadingView = (initialEntries: string[]) => {
    return render(
      <MemoryRouter initialEntries={initialEntries}>
        <FontSizeProvider>
          <Routes>
            <Route path="/novels/:slug/chapter/:chapterNumber" element={<ReadingView />} />
          </Routes>
        </FontSizeProvider>
      </MemoryRouter>
    );
  };

  it('renders chapter content and navigation buttons correctly', async () => {
    (novelService.getChapter as vi.Mock).mockResolvedValue(mockChapter);
    (novelService.getNovel as vi.Mock).mockResolvedValue(mockNovel);

    renderReadingView(['/novels/test-novel/chapter/1']);

    expect(screen.getByText(/Loading chapter.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Test Chapter 1')).toBeInTheDocument();
      expect(screen.getByText('This is the content of test chapter 1.')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Previous Chapter/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Next Chapter/i })).toBeInTheDocument();
    });
  });

  it('displays the reading progress indicator', async () => {
    (novelService.getChapter as vi.Mock).mockResolvedValue(mockChapter);
    (novelService.getNovel as vi.Mock).mockResolvedValue(mockNovel);

    renderReadingView(['/novels/test-novel/chapter/1']);

    await waitFor(() => {
      expect(screen.getByText('Chapter 1 of 2')).toBeInTheDocument();
    });
  });

  it('disables previous button on first chapter', async () => {
    (novelService.getChapter as vi.Mock).mockResolvedValue(mockChapter);
    (novelService.getNovel as vi.Mock).mockResolvedValue(mockNovel);

    renderReadingView(['/novels/test-novel/chapter/1']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Previous Chapter/i })).toBeDisabled();
    });
  });

  it('disables next button on last chapter', async () => {
    const lastChapterMock = { ...mockChapter, chapterNumber: 2 };
    (novelService.getChapter as vi.Mock).mockResolvedValue(lastChapterMock);
    (novelService.getNovel as vi.Mock).mockResolvedValue(mockNovel);

    renderReadingView(['/novels/test-novel/chapter/2']);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Next Chapter/i })).toBeDisabled();
    });
  });

  it('renders loading state', () => {
    (novelService.getChapter as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves
    (novelService.getNovel as vi.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

    renderReadingView(['/novels/test-novel/chapter/1']);

    expect(screen.getByText(/Loading chapter.../i)).toBeInTheDocument();
  });

  it('renders error state', async () => {
    (novelService.getChapter as vi.Mock).mockRejectedValue(new Error('Network error'));
    (novelService.getNovel as vi.Mock).mockRejectedValue(new Error('Network error'));

    renderReadingView(['/novels/test-novel/chapter/1']);

    await waitFor(() => {
      expect(screen.getByText(/Failed to load chapter./i)).toBeInTheDocument();
    });
  });

  it('renders chapter not found state', async () => {
    (novelService.getChapter as vi.Mock).mockResolvedValue(null);
    (novelService.getNovel as vi.Mock).mockResolvedValue(mockNovel);

    renderReadingView(['/novels/test-novel/chapter/1']);

    await waitFor(() => {
      expect(screen.getByText(/Chapter not found./i)).toBeInTheDocument();
    });
  });
});
