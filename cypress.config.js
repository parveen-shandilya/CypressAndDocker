const { defineConfig } = require("cypress");
const easyYopmail = require("./cypress/support/yopmail.js");
const webpackPreprocessor = require('@cypress/webpack-preprocessor');
const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

module.exports = defineConfig({
  chromeWebSecurity: false,
  experimentalModifyObstructiveThirdPartyCode: true,
  reporter: 'cypress-mochawesome-reporter',
  e2e: {
    specPattern: 'cypress/e2e/tests/*.cy.{js,jsx,ts,tsx}', 
    chromeWebSecurity: false,
    experimentalModifyObstructiveThirdPartyCode: true,
    experimentalSessionAndOrigin: true,
    defaultCommandTimeout: 10000,
    "retries": {
    "runMode": 1,
    "openMode": 0
  },
    video: false,
    videoCompression: 1,
    screenshotOnRunFailure: true,
    watchForFileChanges: false,
    viewportWidth: 1920, 
    viewportHeight: 1080,
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      reportDir: 'cypress/reports',
      charts: true,
      reportPageTitle: 'HRMS Running report',
      embeddedScreenshots: true,
      inlineAssets: true,
      videoOnFailOnly: true,
      html: true,
      json: true,
      overwrite: false
    },
    setupNodeEvents(on, config) {
      const options = {
        webpackOptions: {
          resolve: {
            fallback: {
              stream: require.resolve('stream-browserify'),
              querystring: require.resolve('querystring-es3'),
              fs: require.resolve('browserify-fs'),
              zlib: require.resolve('browserify-zlib'),
              assert: require.resolve("assert/"),
              https: false,
              path: false,
              buffer: require.resolve('buffer/'),
              process: require.resolve("process/browser.js"),
              "os": require.resolve("os-browserify/browser"),
              "constants": require.resolve("constants-browserify")
            },
          },
          plugins: [
            new webpack.ProvidePlugin({
              process: 'process/browser.js',
              Buffer: ['buffer', 'Buffer'],
            }),
          ],
        },
      };

      on('file:preprocessor', webpackPreprocessor(options));

      on('task', {
        emailFetcher() {
          return easyYopmail.getNewEmailId();
        },
        contentGetter(someEmail) {
          return easyYopmail.getLatestEmail(someEmail);
        },
        getConfirmaUrl(email) {
          return easyYopmail.getConfirmationURL(email);
        },
        deleteFile(filePath) {
          const fullPath = path.resolve(__dirname, filePath);

          if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
            return { success: true };
          }

          return { success: false, message: 'File not found' };
        }
      });

      on('before:browser:launch', (browser = {}, launchOptions) => {
        const browserName = config.browser || process.env.CYPRESS_browser;

        if (browser.name === 'firefox') {
          launchOptions.preferences['browser.download.folderList'] = 2; // 0 = Desktop, 1 = Downloads, 2 = Custom directory
          launchOptions.preferences['browser.download.dir'] = `${process.cwd()}/cypress/downloads`; // Custom download directory
          launchOptions.preferences['browser.helperApps.neverAsk.saveToDisk'] = 'application/pdf'; // Automatically download PDF files
          launchOptions.preferences['pdfjs.disabled'] = false; // Disable the built-in PDF viewer
        }

        return launchOptions; // Important to return the modified launch options
      });

      require('cypress-mochawesome-reporter/plugin')(on);
      return config;
    },
  },
});
