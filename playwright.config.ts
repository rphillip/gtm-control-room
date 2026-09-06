import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'GITHUB_REPOSITORY=local/gtm-control-room VITE_SITE_URL=https://rphillip.github.io/gtm-control-room npm run build && GITHUB_REPOSITORY=local/gtm-control-room npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173/gtm-control-room/',
    reuseExistingServer: false,
  },
})
