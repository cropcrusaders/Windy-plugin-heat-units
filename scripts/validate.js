#!/usr/bin/env node

/**
 * Validation script for Windy plugin
 * Validates plugin structure, build output, and package contents
 */

import fs from 'fs';
import path from 'path';

function log(message, level = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = level === 'error' ? '❌' : level === 'success' ? '✅' : 'ℹ️';
  console.log(`${prefix} [${timestamp}] ${message}`);
}

function validateFile(filePath, description) {
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    log(`${description}: ${filePath} (${(stats.size / 1024).toFixed(1)} KB)`, 'success');
    return true;
  } else {
    log(`${description}: ${filePath} - NOT FOUND`, 'error');
    return false;
  }
}

function validatePluginStructure() {
  log('🔍 Validating plugin structure...');
  
  const requiredFiles = [
    { path: 'package.json', desc: 'Package configuration' },
    { path: 'plugin.json', desc: 'Plugin metadata' },
    { path: 'rollup.config.js', desc: 'Build configuration' },
    { path: 'tsconfig.json', desc: 'TypeScript configuration' },
    { path: 'src/plugin.ts', desc: 'Main plugin entry' },
    { path: 'src/plugin.svelte', desc: 'Plugin UI component' },
    { path: '.github/workflows/publish-plugin.yml', desc: 'GitHub Actions workflow' },
    { path: 'scripts/release.js', desc: 'Release script' }
  ];
  
  let allValid = true;
  for (const file of requiredFiles) {
    if (!validateFile(file.path, file.desc)) {
      allValid = false;
    }
  }
  
  return allValid;
}

function validatePackageJson() {
  log('📦 Validating package.json...');
  
  try {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    
    const requiredFields = ['name', 'version', 'description', 'main', 'scripts'];
    let valid = true;
    
    for (const field of requiredFields) {
      if (!pkg[field]) {
        log(`Missing required field: ${field}`, 'error');
        valid = false;
      }
    }
    
    const requiredScripts = ['build', 'package', 'release'];
    for (const script of requiredScripts) {
      if (!pkg.scripts[script]) {
        log(`Missing required script: ${script}`, 'error');
        valid = false;
      }
    }
    
    if (valid) {
      log(`Package configuration valid: ${pkg.name} v${pkg.version}`, 'success');
    }
    
    return valid;
  } catch (error) {
    log(`Failed to parse package.json: ${error.message}`, 'error');
    return false;
  }
}

function validatePluginJson() {
  log('🔌 Validating plugin.json...');
  
  try {
    const plugin = JSON.parse(fs.readFileSync('plugin.json', 'utf8'));
    
    const requiredFields = ['name', 'version', 'title', 'description', 'main'];
    let valid = true;
    
    for (const field of requiredFields) {
      if (!plugin[field]) {
        log(`Missing required field: ${field}`, 'error');
        valid = false;
      }
    }
    
    if (valid) {
      log(`Plugin metadata valid: ${plugin.title} v${plugin.version}`, 'success');
    }
    
    return valid;
  } catch (error) {
    log(`Failed to parse plugin.json: ${error.message}`, 'error');
    return false;
  }
}

function validateBuildOutput() {
  log('🏗️ Validating build output...');
  
  const buildFiles = [
    { path: 'dist/plugin.js', desc: 'Compiled plugin' }
  ];
  
  let allValid = true;
  for (const file of buildFiles) {
    if (!validateFile(file.path, file.desc)) {
      allValid = false;
    }
  }
  
  return allValid;
}

function main() {
  log('🚀 Starting Windy plugin validation...');
  
  const validations = [
    { name: 'Plugin Structure', fn: validatePluginStructure },
    { name: 'Package.json', fn: validatePackageJson },
    { name: 'Plugin.json', fn: validatePluginJson },
    { name: 'Build Output', fn: validateBuildOutput }
  ];
  
  let allPassed = true;
  
  for (const validation of validations) {
    try {
      const result = validation.fn();
      if (!result) {
        allPassed = false;
        log(`❌ ${validation.name} validation failed`, 'error');
      } else {
        log(`✅ ${validation.name} validation passed`, 'success');
      }
    } catch (error) {
      allPassed = false;
      log(`❌ ${validation.name} validation error: ${error.message}`, 'error');
    }
  }
  
  if (allPassed) {
    log('🎉 All validations passed! Plugin is ready for release.', 'success');
  } else {
    log('💥 Some validations failed. Please fix the issues before releasing.', 'error');
    process.exit(1);
  }
}

main();