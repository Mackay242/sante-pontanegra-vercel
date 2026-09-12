/**
 * Generate PWA icons (192, 512, maskable, apple-touch-icon, favicon)
 * Uses sharp to render the SVG logo to PNG at various sizes.
 */

import sharp from 'sharp'
import { mkdir, writeFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const PUBLIC_DIR = '/home/z/my-project/public'
const ICONS_DIR = path.join(PUBLIC_DIR, 'icons')

// Source SVG (gradient background + white heart)
const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d7a5f"/>
      <stop offset="100%" stop-color="#1dab84"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="96" fill="url(#g)"/>
  <path d="M256 416c-56-36-112-76-112-144 0-40 32-72 72-72 24 0 45 12 40 32 5-20 16-32 40-32 40 0 72 32 72 72 0 68-56 108-112 144z" fill="white"/>
</svg>`

// Maskable SVG (icon takes 80% of canvas, leaving safe zone)
const MASKABLE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d7a5f"/>
      <stop offset="100%" stop-color="#1dab84"/>
    </linearGradient>
  </defs>
  <rect width="512" height="512" fill="url(#g)"/>
  <g transform="translate(102, 102) scale(0.6)">
    <path d="M256 416c-56-36-112-76-112-144 0-40 32-72 72-72 24 0 45 12 40 32 5-20 16-32 40-32 40 0 72 32 72 72 0 68-56 108-112 144z" fill="white"/>
  </g>
</svg>`

async function generateIcons() {
  if (!existsSync(ICONS_DIR)) {
    await mkdir(ICONS_DIR, { recursive: true })
  }

  // Standard PWA icons
  const sizes = [192, 512]
  for (const size of sizes) {
    await sharp(Buffer.from(ICON_SVG))
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `icon-${size}x${size}.png`))
    console.log(`✓ Generated icon-${size}x${size}.png`)
  }

  // Maskable icons (Android adaptive icon)
  for (const size of [192, 512]) {
    await sharp(Buffer.from(MASKABLE_SVG))
      .resize(size, size)
      .png()
      .toFile(path.join(ICONS_DIR, `maskable-${size}x${size}.png`))
    console.log(`✓ Generated maskable-${size}x${size}.png`)
  }

  // Apple touch icon (180x180, no transparency, square corners)
  await sharp(Buffer.from(ICON_SVG))
    .resize(180, 180)
    .png()
    .flatten({ background: '#0d7a5f' })
    .toFile(path.join(ICONS_DIR, 'apple-touch-icon.png'))
  console.log('✓ Generated apple-touch-icon.png')

  // Favicon (32x32)
  await sharp(Buffer.from(ICON_SVG))
    .resize(32, 32)
    .png()
    .toFile(path.join(PUBLIC_DIR, 'favicon-32.png'))
  console.log('✓ Generated favicon-32.png')

  // Save the SVG icon too
  await writeFile(path.join(PUBLIC_DIR, 'icon.svg'), ICON_SVG)
  console.log('✓ Saved icon.svg')

  console.log('\n🎉 All PWA icons generated in public/icons/')
}

generateIcons().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
