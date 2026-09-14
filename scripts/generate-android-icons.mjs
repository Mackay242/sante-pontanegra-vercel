/**
 * Generate Android app icons (mipmap-*) from the source SVG.
 * v2: With green background for adaptive icons (fixes white icon issue)
 */

import sharp from 'sharp'
import { mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ROOT = '/home/z/my-project'
const ANDROID_RES = path.join(ROOT, 'android/app/src/main/res')

// Icon with GREEN background (visible on all Android versions)
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

// Round icon (circular, for round launcher)
const ROUND_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d7a5f"/>
      <stop offset="100%" stop-color="#1dab84"/>
    </linearGradient>
    <clipPath id="circle"><circle cx="256" cy="256" r="256"/></clipPath>
  </defs>
  <g clip-path="url(#circle)">
    <rect width="512" height="512" fill="url(#g)"/>
    <path d="M256 416c-56-36-112-76-112-144 0-40 32-72 72-72 24 0 45 12 40 32 5-20 16-32 40-32 40 0 72 32 72 72 0 68-56 108-112 144z" fill="white"/>
  </g>
</svg>`

// Foreground for adaptive icon (white heart on transparent, 4/5 of canvas)
const FOREGROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <rect width="432" height="432" fill="transparent"/>
  <g transform="translate(72, 72) scale(0.5625)">
    <path d="M256 416c-56-36-112-76-112-144 0-40 32-72 72-72 24 0 45 12 40 32 5-20 16-32 40-32 40 0 72 32 72 72 0 68-56 108-112 144z" fill="white"/>
  </g>
</svg>`

const SIZES = [
  { folder: 'mipmap-mdpi', size: 48 },
  { folder: 'mipmap-hdpi', size: 72 },
  { folder: 'mipmap-xhdpi', size: 96 },
  { folder: 'mipmap-xxhdpi', size: 144 },
  { folder: 'mipmap-xxxhdpi', size: 192 },
]

async function generateAndroidIcons() {
  for (const { folder, size } of SIZES) {
    const targetFolder = path.join(ANDROID_RES, folder)
    if (!existsSync(targetFolder)) {
      await mkdir(targetFolder, { recursive: true })
    }

    // ic_launcher.png — full icon with green gradient background
    await sharp(Buffer.from(ICON_SVG))
      .resize(size, size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'))
    console.log(`✓ ${folder}/ic_launcher.png (${size}x${size})`)

    // ic_launcher_round.png — circular version
    await sharp(Buffer.from(ROUND_ICON_SVG))
      .resize(size, size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'))
    console.log(`✓ ${folder}/ic_launcher_round.png (${size}x${size})`)

    // ic_launcher_foreground.png — for adaptive icon (transparent bg)
    const foregroundSize = Math.round(size * 1.5)
    await sharp(Buffer.from(FOREGROUND_SVG))
      .resize(foregroundSize, foregroundSize)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'))
    console.log(`✓ ${folder}/ic_launcher_foreground.png (${foregroundSize}x${foregroundSize})`)
  }

  console.log('\n🎉 All Android icons regenerated with green background!')
}

generateAndroidIcons().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
