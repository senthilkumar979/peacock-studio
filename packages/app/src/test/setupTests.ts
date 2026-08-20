import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { framerMotionMock } from './framerMotionMock';

vi.mock('framer-motion', () => framerMotionMock);

afterEach(() => {
  cleanup();
});
