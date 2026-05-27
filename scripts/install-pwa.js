const { execSync } = require('child_process');
const path = require('path');

console.log('📦 Installing PWA dependencies...\n');

const frontendPath = path.join(__dirname, '..', 'frontend');

try {
  console.log(`Working directory: ${frontendPath}\n`);
  
  // Install vite-plugin-pwa and workbox-window
  console.log('Installing vite-plugin-pwa and workbox-window...');
  execSync('npm install -D vite-plugin-pwa workbox-window', {
    cwd: frontendPath,
    stdio: 'inherit'
  });
  
  console.log('\n✅ PWA dependencies installed successfully!');
  console.log('\n📝 Next steps:');
  console.log('1. Restart the dev server');
  console.log('2. Check browser console for PWA registration');
  console.log('3. Test PWA install prompt');
  
} catch (error) {
  console.error('\n❌ Error installing dependencies:', error.message);
  process.exit(1);
}
