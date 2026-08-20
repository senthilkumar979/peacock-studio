import 'fake-indexeddb/auto';
import { beforeEach } from 'vitest';
import { installChromeMock, resetChromeMockStores } from './chromeMock';

installChromeMock();

beforeEach(() => {
  resetChromeMockStores();
  document.body.innerHTML = '';
  document.head.innerHTML = '';
});
