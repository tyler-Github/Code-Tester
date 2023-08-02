const fs = require('fs');
const { execSync } = require('child_process');
const axios = require('axios');
const util = require('util');
const { inspect } = require('util');
const readline = require('readline');

const CONFIG_PATH = './config.json';

// Load configuration
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
}

// Utility functions
const executeCommand = (command, options = {}) => {
  try {
    console.log(`Executing: ${command}`);
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error('Command execution failed:', error.message);
    throw error;
  }
};

// Delete repository folder
const deleteRepositoryFolder = () => {
    try {
      if (fs.existsSync(config.repository.path)) {
        fs.rmdirSync(config.repository.path, { recursive: true });
        console.log('Repository folder deleted.');
      } else {
        console.log('Repository folder does not exist.');
      }
    } catch (error) {
      console.error('Error deleting repository folder:', error.message);
    }
  };
  
  // Create readline interface for user input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  
  // Prompt for deleting repository folder
  const promptToDeleteRepository = () => {
    rl.question('Do you want to delete the repository folder? (yes/no): ', (answer) => {
      if (answer.toLowerCase() === 'yes') {
        deleteRepositoryFolder();
      }
      rl.close();
    });
  };

// Features
function cloneOrUpdateRepository() {
  try {
    if (!fs.existsSync(config.repository.path)) {
      console.log('Cloning repository...');
      executeCommand(`git clone ${config.repository.url} ${config.repository.path}`);
    } else {
      console.log('Updating repository...');
      executeCommand(`cd ${config.repository.path} && git pull`);
    }
  } catch (error) {
    console.error('Error cloning or updating repository:', error.message);
    throw error;
  }
}

function installDependencies() {
  try {
    console.log('Installing dependencies...');
    executeCommand(`cd ${config.repository.path} && npm install`);
  } catch (error) {
    console.error('Error installing dependencies:', error.message);
    throw error;
  }
}

function checkDependencies() {
  try {
    console.log('Checking for outdated and vulnerable dependencies...');
    executeCommand(`cd ${config.repository.path} && npm audit`);
  } catch (error) {
    console.error('Error checking dependencies:', error.message);
    throw error;
  }
}

function lintCode() {
  try {
    console.log('Linting code...');
    executeCommand(`cd ${config.repository.path} && npx eslint . --fix`);
  } catch (error) {
    console.error('Error linting code:', error.message);
    throw error;
  }
}

function runTests() {
  try {
    console.log('Running tests...');
    executeCommand(`cd ${config.repository.path} && npm test`);
  } catch (error) {
    console.error('Error running tests:', error.message);
    throw error;
  }
}

function runApplication() {
  try {
    console.log('Running application...');
    executeCommand(`cd ${config.repository.path} && npm start`);
  } catch (error) {
    console.error('Error running application:', error.message);
    throw error;
  }
}

async function checkForUpdates() {
  try {
    const response = await axios.get(`${config.repository.url}/releases/latest`);
    const latestVersion = response.data.tag_name;

    if (latestVersion !== config.version) {
      console.log(`An update is available! Current version: ${config.version}, Latest version: ${latestVersion}`);
      // You can implement the update process here
    } else {
      console.log('No updates available.');
    }
  } catch (error) {
    console.error('Error checking for updates:', error.message);
    throw error;
  }
}

function buildDockerImage() {
  try {
    console.log('Building Docker image...');
    executeCommand(`cd ${config.repository.path} && docker build -t my-app .`);
  } catch (error) {
    console.error('Error building Docker image:', error.message);
    throw error;
  }
}

// Entry point
async function runApp() {
  try {
    if (config.features.cloneOrUpdateRepository) {
      cloneOrUpdateRepository();
    }
    if (config.features.installDependencies) {
      installDependencies();
    }
    if (config.features.deleteRepository) {
        promptToDeleteRepository();
    }
    if (config.features.checkDependencies) {
      checkDependencies();
    }
    if (config.features.lintCode) {
      lintCode();
    }
    if (config.features.runTests) {
      runTests();
    }
    if (config.features.runApplication) {
      runApplication();
    }
    if (config.features.checkForUpdates) {
      await checkForUpdates();
    }
    if (config.features.buildDockerImage) {
      buildDockerImage();
    }
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

// Enhanced debugging
const inspectOptions = {
  depth: 2,
  colors: true,
};
const debugLog = (label, data) => {
  console.log(`${label}:`, inspect(data, inspectOptions));
};
  

// Run the application
runApp();
