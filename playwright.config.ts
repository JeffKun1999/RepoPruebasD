import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [
    ['html'],
    ['list']
  ],
  timeout: 180000,

  use: {
    baseURL: 'http://185.172.178.2:24001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20000,
    viewport: { width: 1280, height: 800 },
    ...devices['Desktop Chrome'],
  },

  projects: [
    // =====================================================
    // PROYECTOS RAPIDOS (sin navegador visible)
    // =====================================================
    {
      name: '01-login',
      testMatch: /01-login\.spec\.ts/,
    },
    {
      name: '02-flujo-e2e',
      testMatch: /02-flujo-completo\.spec\.ts/,
      dependencies: ['01-login'],
    },
    {
      name: '03-validaciones',
      testMatch: /03-validaciones\.spec\.ts/,
      dependencies: ['02-flujo-e2e'],
    },
    {
      name: '03-roles',
      testMatch: /03-roles\.spec\.ts/,
      dependencies: ['02-flujo-e2e'],
    },
    {
      name: '04-edicion',
      testMatch: /04-edicion\.spec\.ts/,
      dependencies: ['02-flujo-e2e'],
    },
    {
      name: '05-login-cliente',
      testMatch: /05-login-cliente\.spec\.ts/,
      dependencies: ['02-flujo-e2e'],
    },
    {
      name: '07-promesas-pago',
      testMatch: /07-promesas-pago\.spec\.ts/,
      dependencies: ['02-flujo-e2e'],
    },

    // =====================================================
    // PROYECTOS VISUALES (navegador visible, lento)
    // =====================================================
    {
      name: 'visual-login',
      testMatch: /01-login\.spec\.ts/,
      use: {
        headless: false,
        slowMo: 800,
        launchOptions: {
          slowMo: 800,
        },
      },
    },
    {
      name: 'visual-e2e',
      testMatch: /02-flujo-completo\.spec\.ts/,
      dependencies: ['visual-login'],
      use: {
        headless: false,
        slowMo: 800,
        launchOptions: {
          slowMo: 800,
        },
      },
    },
    {
      name: 'visual-validaciones',
      testMatch: /03-validaciones\.spec\.ts/,
      dependencies: ['visual-e2e'],
      use: {
        headless: false,
        slowMo: 800,
        launchOptions: {
          slowMo: 800,
        },
      },
    },
    {
      name: 'visual-roles',
      testMatch: /03-roles\.spec\.ts/,
      dependencies: ['visual-e2e'],
      use: {
        headless: false,
        slowMo: 800,
        launchOptions: {
          slowMo: 800,
        },
      },
    },
    {
      name: 'visual-edicion',
      testMatch: /04-edicion\.spec\.ts/,
      dependencies: ['visual-e2e'],
      use: {
        headless: false,
        slowMo: 800,
        launchOptions: {
          slowMo: 800,
        },
      },
    },
    {
      name: 'visual-login-cliente',
      testMatch: /05-login-cliente\.spec\.ts/,
      dependencies: ['visual-e2e'],
      use: {
        headless: false,
        slowMo: 800,
        launchOptions: {
          slowMo: 800,
        },
      },
    },
    {
      name: 'visual-promesas-pago',
      testMatch: /07-promesas-pago\.spec\.ts/,
      dependencies: ['visual-e2e'],
      use: {
        headless: false,
        slowMo: 800,
        launchOptions: {
          slowMo: 800,
        },
      },
    },
  ],
});
