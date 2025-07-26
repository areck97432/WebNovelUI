import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { FontSizeProvider, useFontSize } from './FontSizeContext';
import { vi } from 'vitest';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value; },
    clear: () => { store = {}; },
    removeItem: (key: string) => { delete store[key]; },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('FontSizeContext', () => {
  const TestComponent: React.FC = () => {
    const { fontSize, increaseFontSize, decreaseFontSize } = useFontSize();
    return (
      <div>
        <span data-testid="font-size-display">{fontSize}</span>
        <button onClick={increaseFontSize}>Increase</button>
        <button onClick={decreaseFontSize}>Decrease</button>
      </div>
    );
  };

  beforeEach(() => {
    localStorageMock.clear();
  });

  it('provides default font size if no preference is stored', () => {
    render(
      <FontSizeProvider>
        <TestComponent />
      </FontSizeProvider>
    );
    expect(screen.getByTestId('font-size-display')).toHaveTextContent('16');
  });

  it('increases font size', () => {
    render(
      <FontSizeProvider>
        <TestComponent />
      </FontSizeProvider>
    );

    fireEvent.click(screen.getByText('Increase'));
    expect(screen.getByTestId('font-size-display')).toHaveTextContent('18');
    expect(localStorageMock.getItem('fontSize')).toBe('18');
  });

  it('decreases font size', () => {
    localStorageMock.setItem('fontSize', '18');
    render(
      <FontSizeProvider>
        <TestComponent />
      </FontSizeProvider>
    );

    fireEvent.click(screen.getByText('Decrease'));
    expect(screen.getByTestId('font-size-display')).toHaveTextContent('16');
    expect(localStorageMock.getItem('fontSize')).toBe('16');
  });

  it('does not increase font size beyond max', () => {
    localStorageMock.setItem('fontSize', '24');
    render(
      <FontSizeProvider>
        <TestComponent />
      </FontSizeProvider>
    );

    fireEvent.click(screen.getByText('Increase'));
    expect(screen.getByTestId('font-size-display')).toHaveTextContent('24');
    expect(localStorageMock.getItem('fontSize')).toBe('24');
  });

  it('does not decrease font size below min', () => {
    localStorageMock.setItem('fontSize', '12');
    render(
      <FontSizeProvider>
        <TestComponent />
      </FontSizeProvider>
    );

    fireEvent.click(screen.getByText('Decrease'));
    expect(screen.getByTestId('font-size-display')).toHaveTextContent('12');
    expect(localStorageMock.getItem('fontSize')).toBe('12');
  });

  it('loads font size from localStorage on initial render', () => {
    localStorageMock.setItem('fontSize', '20');
    render(
      <FontSizeProvider>
        <TestComponent />
      </FontSizeProvider>
    );
    expect(screen.getByTestId('font-size-display')).toHaveTextContent('20');
  });
});
