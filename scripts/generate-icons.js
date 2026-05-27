/**
 * 🎨 ICON GENERATOR
 * Tự động generate tất cả icon sizes từ logo gốc
 * 
 * Usage: node scripts/generate-icons.js
 */

const fs = require('fs');
const path = require('path');

// Icon sizes cần generate
const ICON_SIZES = {
  // Favicon sizes
  favicon: [
    { size: 16, name: 'favicon-16x16.png' },
    { size: 32, name: 'favicon-32x32.png' },
    { size: 48, name: 'favicon-48x48.png' },
  ],
  
  // Apple Touch Icons
  apple: [
    { size: 57, name: 'apple-touch-icon-57x57.png' },
    { size: 60, name: 'apple-touch-icon-60x60.png' },
    { size: 72, name: 'apple-touch-icon-72x72.png' },
    { size: 76, name: 'apple-touch-icon-76x76.png' },
    { size: 114, name: 'apple-touch-icon-114x114.png' },
    { size: 120, name: 'apple-touch-icon-120x120.png' },
    { size: 144, name: 'apple-touch-icon-144x144.png' },
    { size: 152, name: 'apple-touch-icon-152x152.png' },
    { size: 180, name: 'apple-touch-icon-180x180.png' },
  ],
  
  // Android/Chrome icons
  android: [
    { size: 36, name: 'android-chrome-36x36.png' },
    { size: 48, name: 'android-chrome-48x48.png' },
    { size: 72, name: 'android-chrome-72x72.png' },
    { size: 96, name: 'android-chrome-96x96.png' },
    { size: 144, name: 'android-chrome-144x144.png' },
    { size: 192, name: 'android-chrome-192x192.png' },
    { size: 256, name: 'android-chrome-256x256.png' },
    { size: 384, name: 'android-chrome-384x384.png' },
    { size: 512, name: 'android-chrome-512x512.png' },
  ],
  
  // Microsoft Tiles
  mstile: [
    { size: 70, name: 'mstile-70x70.png' },
    { size: 144, name: 'mstile-144x144.png' },
    { size: 150, name: 'mstile-150x150.png' },
    { size: 310, name: 'mstile-310x310.png' },
  ],
};

// Paths
const SOURCE_LOGO = path.join(__dirname, '../frontend/src/assets/logoweb.png');
const OUTPUT_DIR = path.join(__dirname, '../frontend/public');
const FRONTEND_DIR = path.join(__dirname, '../frontend');

console.log('🎨 ICON GENERATOR');
console.log('================\n');

// Check if source logo exists
if (!fs.existsSync(SOURCE_LOGO)) {
  console.error('❌ Logo không tồn tại:', SOURCE_LOGO);
  console.log('\n💡 Hướng dẫn:');
  console.log('1. Đặt logo gốc tại: frontend/src/assets/logoweb.png');
  console.log('2. Logo nên là PNG với nền trong suốt');
  console.log('3. Kích thước tối thiểu: 512x512px');
  console.log('4. Chạy lại: node scripts/generate-icons.js');
  process.exit(1);
}

console.log('✅ Tìm thấy logo:', SOURCE_LOGO);
console.log('📁 Output directory:', OUTPUT_DIR);
console.log('');

// Create output directory if not exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log('✅ Đã tạo thư mục output');
}

// Check if Sharp is available
let sharp;
try {
  // Try to require sharp from frontend node_modules
  sharp = require(path.join(FRONTEND_DIR, 'node_modules/sharp'));
  console.log('✅ Sharp library đã sẵn sàng\n');
} catch (error) {
  console.error('❌ Sharp chưa được cài đặt!');
  console.log('\n💡 Cài đặt Sharp:');
  console.log('cd frontend');
  console.log('npm install sharp --save-dev');
  console.log('\nSau đó chạy lại script này.');
  process.exit(1);
}

// Generate icons
async function generateIcons() {
  console.log('🔄 Bắt đầu generate icons...\n');
  
  let totalGenerated = 0;
  
  // Generate all icon categories
  for (const [category, sizes] of Object.entries(ICON_SIZES)) {
    console.log(`📦 ${category.toUpperCase()} Icons:`);
    
    for (const { size, name } of sizes) {
      try {
        const outputPath = path.join(OUTPUT_DIR, name);
        
        await sharp(SOURCE_LOGO)
          .resize(size, size, {
            fit: 'contain',
            background: { r: 255, g: 255, b: 255, alpha: 0 }
          })
          .png()
          .toFile(outputPath);
        
        console.log(`  ✅ ${name} (${size}x${size})`);
        totalGenerated++;
      } catch (error) {
        console.error(`  ❌ Lỗi tạo ${name}:`, error.message);
      }
    }
    
    console.log('');
  }
  
  // Generate favicon.ico (using 32x32)
  try {
    const faviconPath = path.join(OUTPUT_DIR, 'favicon.ico');
    await sharp(SOURCE_LOGO)
      .resize(32, 32, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(faviconPath);
    
    console.log('✅ favicon.ico (32x32)\n');
    totalGenerated++;
  } catch (error) {
    console.error('❌ Lỗi tạo favicon.ico:', error.message);
  }
  
  // Generate apple-touch-icon.png (default 180x180)
  try {
    const appleTouchPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
    await sharp(SOURCE_LOGO)
      .resize(180, 180, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 }
      })
      .png()
      .toFile(appleTouchPath);
    
    console.log('✅ apple-touch-icon.png (180x180)\n');
    totalGenerated++;
  } catch (error) {
    console.error('❌ Lỗi tạo apple-touch-icon.png:', error.message);
  }
  
  console.log('================');
  console.log(`🎉 Hoàn thành! Đã tạo ${totalGenerated} icons`);
  console.log('📁 Icons được lưu tại:', OUTPUT_DIR);
  console.log('');
  console.log('📝 Bước tiếp theo:');
  console.log('1. Kiểm tra icons trong thư mục public/');
  console.log('2. Cập nhật index.html với các link tags');
  console.log('3. Cập nhật manifest.json với icon paths');
  console.log('4. Test PWA install');
}

// Run generator
generateIcons().catch(error => {
  console.error('❌ Lỗi:', error);
  process.exit(1);
});
