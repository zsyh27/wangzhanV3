import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright测试配置
 * 使用系统安装的Edge浏览器，无需额外下载
 * 测试执行顺序：先跑冒烟测试，通过后再跑其他测试
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { open: 'never' }],
    ['list']
  ],
  
  use: {
    baseURL: 'http://localhost:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    channel: 'msedge',
  },

  projects: [
    {
      name: '冒烟测试',
      testMatch: /smoke\.spec\.ts/,
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
    {
      name: '完整测试',
      testIgnore: /smoke\.spec\.ts/,
      dependencies: ['冒烟测试'],
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge',
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3001',
    reuseExistingServer: !process.env.CI,
  },
  
})
