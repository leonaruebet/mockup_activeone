// Jest setup for Next.js web app
import '@testing-library/jest-dom';

// Mock Next.js modules
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams(),
}));

jest.mock('next/headers', () => ({
  headers: () => new Map([
    ['user-agent', 'test-agent'],
    ['x-forwarded-for', '127.0.0.1'],
  ]),
  cookies: () => ({
    get: jest.fn(() => ({ value: 'test-cookie' })),
    set: jest.fn(),
  }),
}));

// Mock environment variables
process.env.NODE_ENV = 'test';
process.env.NEXT_PUBLIC_APP_URL = 'http://localhost:3000';
process.env.ALLOW_DEV_AUTH = 'true';

// Global test utilities
global.mockFetch = (response, status = 200) => {
  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: status >= 200 && status < 300,
      status,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    })
  );
};

// Reset mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Suppress console warnings during tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactDOM.render is no longer supported')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};