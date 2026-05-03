import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    viewport: { width: 1920, height: 1080 },
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth.setup\.ts/,
    },

    // Project for REGULATOR tests
    {
      name: 'regulator',
      testMatch: /regulator-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/regulator.json',
      },
      dependencies: ['setup'],
    },

    // Project for MANUFACTURER tests
    {
      name: 'manufacturer',
      testMatch: /manufacturer-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/manufacturer.json',
      },
      dependencies: ['setup'],
    },

    // Project for DISTRIBUTOR tests
    {
      name: 'distributor',
      testMatch: /distributor-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/distributor.json',
      },
      dependencies: ['setup'],
    },

    // Project for PHARMACY tests
    {
      name: 'pharmacy',
      testMatch: /pharmacy-.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/pharmacy.json',
      },
      dependencies: ['setup'],
    },
  ],
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  webServer: {
    command: 'npx cross-env VITE_COVERAGE=true npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    stdout: 'ignore',
    stderr: 'pipe',
  },
});