#!/usr/bin/env node

/**
 * Release script for Windy plugin
 * Handles building, packaging, and uploading the plugin to Windy servers
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Configuration
const PACKAGE_FILE = 'windy-plugin-heat-units.tar';
const TIMEOUT = 30000; // 30 seconds
const OFFLINE_MODE = process.env.NODE_ENV === 'test' || process.env.OFFLINE_MODE === 'true';

// Potential API endpoints to try (in order of preference)
const API_ENDPOINTS = [
  'https://api.windy.com/plugins/v1/upload',
  'https://plugins.windy.com/api/v1/upload', 
  'https://www.windy.com/plugins/api/v1/upload',
  'https://api.windy.com/v1/plugins/upload',
  'https://windy.com/api/plugins/upload'
];

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function runCommand(command, description) {
  log(`Running: ${description}`);
  try {
    const output = execSync(command, { 
      encoding: 'utf8', 
      stdio: ['inherit', 'pipe', 'pipe'],
      timeout: TIMEOUT 
    });
    log(`✅ ${description} completed successfully`);
    return output;
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'error');
    throw error;
  }
}

function checkApiKey() {
  const apiKey = process.env.WINDY_API_KEY;
  if (!apiKey) {
    log('Error: WINDY_API_KEY environment variable is not set', 'error');
    log('Please set your Windy API key: export WINDY_API_KEY=your_key_here', 'error');
    process.exit(1);
  }
  
  if (apiKey.length < 10) {
    log('Warning: API key seems too short, please verify it is correct', 'error');
  }
  
  log(`API key found (${apiKey.substring(0, 8)}...)`);
  return apiKey;
}

function buildPlugin() {
  log('Building plugin...');
  runCommand('npm run build', 'Plugin build');
}

function packagePlugin() {
  log('Creating plugin package...');
  
  // Remove existing package if it exists
  if (fs.existsSync(PACKAGE_FILE)) {
    fs.unlinkSync(PACKAGE_FILE);
    log(`Removed existing ${PACKAGE_FILE}`);
  }
  
  runCommand('npm run package', 'Plugin packaging');
  
  // Verify package was created
  if (!fs.existsSync(PACKAGE_FILE)) {
    throw new Error(`Package file ${PACKAGE_FILE} was not created`);
  }
  
  const stats = fs.statSync(PACKAGE_FILE);
  log(`Package created: ${PACKAGE_FILE} (${(stats.size / 1024).toFixed(1)} KB)`);
}

async function uploadPlugin(apiKey) {
  if (OFFLINE_MODE) {
    log('⚠️ Running in offline mode - skipping actual upload');
    log('🎯 In production, would upload to Windy API endpoints');
    return;
  }
  
  log('Uploading plugin to Windy...');
  
  for (let i = 0; i < API_ENDPOINTS.length; i++) {
    const endpoint = API_ENDPOINTS[i];
    log(`Trying endpoint ${i + 1}/${API_ENDPOINTS.length}: ${endpoint}`);
    
    const curlCommand = [
      'curl',
      '--fail',
      '--show-error',
      '--silent',
      '--max-time', '30',
      '--retry', '2',
      '--retry-delay', '5',
      '-X', 'POST',
      `'${endpoint}'`,
      '-H', `'x-windy-api-key: ${apiKey}'`,
      '-H', `'User-Agent: windy-plugin-heat-units/1.0.1'`,
      '-F', `'plugin_archive=@./${PACKAGE_FILE}'`
    ].join(' ');
    
    try {
      const output = execSync(curlCommand, { 
        encoding: 'utf8',
        stdio: ['inherit', 'pipe', 'pipe'],
        timeout: TIMEOUT 
      });
      
      log(`✅ Upload successful to ${endpoint}`, 'success');
      log(`Response: ${output}`);
      return;
      
    } catch (error) {
      const errorMsg = error.stderr || error.message;
      log(`❌ Upload failed to ${endpoint}: ${errorMsg}`, 'error');
      
      // If this is the last endpoint, throw the error
      if (i === API_ENDPOINTS.length - 1) {
        throw new Error(`All upload endpoints failed. Last error: ${errorMsg}`);
      }
      
      // Otherwise continue to next endpoint
      log(`Trying next endpoint...`);
    }
  }
}

function validateEnvironment() {
  log('Validating environment...');
  
  // Check if we're in the right directory
  if (!fs.existsSync('package.json')) {
    throw new Error('package.json not found. Please run this script from the project root.');
  }
  
  if (!fs.existsSync('plugin.json')) {
    throw new Error('plugin.json not found. This does not appear to be a Windy plugin project.');
  }
  
  // Check required commands
  try {
    execSync('which curl', { stdio: 'ignore' });
  } catch {
    throw new Error('curl command not found. Please install curl.');
  }
  
  try {
    execSync('which npm', { stdio: 'ignore' });
  } catch {
    throw new Error('npm command not found. Please install Node.js and npm.');
  }
  
  log('Environment validation passed');
}

async function main() {
  try {
    log('🚀 Starting Windy plugin release process...');
    
    // Validate environment
    validateEnvironment();
    
    // Check API key
    const apiKey = checkApiKey();
    
    // Build the plugin
    buildPlugin();
    
    // Package the plugin
    packagePlugin();
    
    // Upload the plugin
    await uploadPlugin(apiKey);
    
    log('🎉 Plugin release completed successfully!', 'success');
    log('Your plugin should be available shortly at:');
    log(`https://www.windy.com/plugins/windy-plugin-heat-units/plugin.json`);
    
  } catch (error) {
    log(`💥 Release failed: ${error.message}`, 'error');
    process.exit(1);
  }
}

// Run the main function
main();