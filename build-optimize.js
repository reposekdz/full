#!/usr/bin/env node

/**
 * Build Optimization Script
 * Fixes common build issues and optimizes bundle size
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Starting build optimization...');

// 1. Clean dist directory
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  fs.rmSync(distPath, { recursive: true, force: true });
  console.log('✅ Cleaned dist directory');
}

// 2. Check for large files that might cause issues
const srcPath = path.join(__dirname, 'src');
const checkLargeFiles = (dir) => {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  
  files.forEach(file => {
    const fullPath = path.join(dir, file.name);
    
    if (file.isDirectory()) {
      checkLargeFiles(fullPath);
    } else if (file.isFile()) {
      const stats = fs.statSync(fullPath);
      const sizeInMB = stats.size / (1024 * 1024);
      
      if (sizeInMB > 1) {
        console.log(`⚠️  Large file detected: ${fullPath} (${sizeInMB.toFixed(2)} MB)`);
      }
    }
  });
};

checkLargeFiles(srcPath);

// 3. Optimize package.json for build
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Add build optimization scripts if not present
if (!packageJson.scripts['build:analyze']) {
  packageJson.scripts['build:analyze'] = 'vite build --mode analyze';
}

if (!packageJson.scripts['build:prod']) {
  packageJson.scripts['build:prod'] = 'NODE_ENV=production vite build';
}

fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log('✅ Updated package.json with optimization scripts');

// 4. Create .env.production if it doesn't exist
const envProdPath = path.join(__dirname, '.env.production');
if (!fs.existsSync(envProdPath)) {
  const envContent = `# Production Environment Variables
NODE_ENV=production
VITE_API_URL=https://your-api-domain.com/api
VITE_WS_URL=wss://your-api-domain.com
VITE_APP_VERSION=1.0.0
VITE_BUILD_DATE=${new Date().toISOString()}
`;
  fs.writeFileSync(envProdPath, envContent);
  console.log('✅ Created .env.production file');
}

console.log('🎉 Build optimization complete!');
console.log('\n📋 Next steps:');
console.log('1. Run: npm run build');
console.log('2. If build fails, check the error messages above');
console.log('3. For deployment, use the dist/ folder');
console.log('\n💡 Tips:');
console.log('- Large files should be moved to public/ folder');
console.log('- Use dynamic imports for heavy libraries');
console.log('- Consider code splitting for better performance');