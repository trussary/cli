import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.test.ts'],
    testTimeout: 20_000,
    // Renderer snapshots must not depend on whether the runner has a TTY.
    env: { NO_COLOR: '1' },
  },
});
