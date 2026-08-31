import { defineConfig, devices } from '@playwright/test'

/**
 * Runs against real dev servers (web + api) and the real Neon database —
 * consistent with how this project has been verified throughout (AGENTS.md
 * never introduced a mocking layer for the DB). Each test uses its own
 * device id and cleans up after itself.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 7'] },
      testIgnore: /voice-flow\.spec\.ts/,
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 14'] },
      testIgnore: /voice-flow\.spec\.ts/,
    },
    {
      name: 'Desktop Chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /voice-flow\.spec\.ts/,
    },
    {
      // Fake media device flags only work on Chromium, and only apply at
      // launch time — this project exists solely to run voice-flow.spec.ts
      // with real MediaRecorder mechanics against a synthetic signal
      // (network calls are still mocked; see that file for why).
      name: 'Voice (Chromium, fake mic)',
      testMatch: /voice-flow\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        permissions: ['microphone'],
        launchOptions: {
          args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'],
        },
      },
    },
  ],
})
