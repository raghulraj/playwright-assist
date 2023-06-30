const { chromium, firefox, webkit } = require('playwright');

async function globalSetup() {
  // Get the browser configuration based on the package.json or use a default
  const packageJson = require('./package.json');
  const browserName = packageJson.browser || 'chromium';

  let browserConfig;
  switch (browserName) {
    case 'chromium':
      browserConfig = chromium;
      break;
    case 'firefox':
      browserConfig = firefox;
      break;
    case 'webkit':
      browserConfig = webkit;
      break;
    default:
      throw new Error(`Unsupported browser: ${browserName}`);
  }

  // Launch the browser and store the instance in the global object
  const browser = await browserConfig.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  global.browser = browser;
  global.context = context;
  global.page = page;
}

async function globalTeardown() {
  // Close the browser in the global teardown step
  if (global.browser) {
    await global.browser.close();
  }
}

const PlaywrightSetup = () => {
  const config = defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || 'http://turbify.com',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
  config.globalSetup = globalSetup(browserName);
  config.globalTeardown = globalTeardown;

  return config;
}

module.exports = {
    PlaywrightSetup
};
