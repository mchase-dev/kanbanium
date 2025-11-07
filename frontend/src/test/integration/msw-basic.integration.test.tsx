/**
 * Basic MSW integration test to verify setup
 */
import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from '../mocks/server';

// Start MSW server before tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

// Reset handlers after each test
afterEach(() => {
  server.resetHandlers();
});

// Close server after tests
afterAll(() => {
  server.close();
});

describe('MSW Integration - Basic', () => {
  it('MSW server should be configured', () => {
    expect(server).toBeDefined();
  });

  it('should intercept API calls', async () => {
    const response = await fetch('http://localhost:5124/api/referencedata/statuses');
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(data.data).toHaveLength(3);
    expect(data.data[0].name).toBe('To Do');
  });

  it('should intercept task API calls', async () => {
    const response = await fetch('http://localhost:5124/api/tasks/task-1');
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data.success).toBe(true);
    expect(data.data.title).toBe('Test Task');
  });
});
