/**
 * Generate Android app icons with CORRECT adaptive icon dimensions.
 * 
 * Android adaptive icon specs:
 * - Full icon: 48dp (mdpi), 72dp (hdpi), 96dp (xhdpi), 144dp (xxhdpi), 192dp (xxxhdpi)
 * - Foreground: 108dp (with 72dp safe zone in center)
 *   - mdpi: 108px, hdpi: 162px, xhdpi: 216px, xxhdpi: 324px, xxxhdpi: 432px
 */

import sharp from 'sharp'
import { existsSync } from 'fs'
import path from 'path'

const ROOT = '/home/z/my-project'
const ANDROID_RES = path.join(ROOT, 'android/app/src/main/res')

// Full icon with GREEN background + WHITE heart (for non-adaptive)
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

// Round icon (circular)
const ROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d7a5f"/>
      <stop offset="100%" stop-color="#1dab84"/>
    </linearGradient>
    <clipPath id="c"><circle cx="256" cy="256" r="256"/></clipPath>
  </defs>
  <g clip-path="url(#c)">
    <rect width="512" height="512" fill="url(#g)"/>
    <path d="M256 416c-56-36-112-76-112-144 0-40 32-72 72-72 24 0 45 12 40 32 5-20 16-32 40-32 40 0 72 32 72 72 0 68-56 108-112 144z" fill="white"/>
  </g>
</svg>`

// Foreground: white heart centered, LARGER, with proper padding for adaptive icon
// The heart fills ~60% of the canvas (safe zone = center 66%)
const FOREGROUND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 432 432" width="432" height="432">
  <rect width="432" height="432" fill="transparent"/>
  <g transform="translate(72, 72) scale(0.5625)">
    <path d="M256 416c-56-36-112-76-112-144 0-40 32-72 72-72 24 0 45 12 40 32 5-20 16-32 40-32 40 0 72 32 72 72 0 68-56 108-112 144z" fill="white"/>
  </g>
</svg>`

// CORRECT dimensions for Android adaptive icons
const ICON_SIZES = [
  { folder: 'mipmap-mdpi', icon: 48, foreground: 108 },
  { folder: 'mipmap-hdpi', icon: 72, foreground: 162 },
  { folder: 'mipmap-xhdpi', icon: 96, foreground: 216 },
  { folder: 'mipmap-xxhdpi', icon: 144, foreground: 324 },
  { folder: 'mipmap-xxxhdpi', icon: 192, foreground: 432 },
]

async function generate() {
  for (const { folder, icon, foreground } of ICON_SIZES) {
    const target = path.join(ANDROID_RES, folder)
    if (!existsSync(target)) continue

    // ic_launcher.png — full icon (green bg + white heart)
    await sharp(Buffer.from(ICON_SVG)).resize(icon, icon).png()
      .toFile(path.join(target, 'ic_launcher.png'))
    console.log(`✓ ${folder}/ic_launcher.png (${icon}x${icon})`)

    // ic_launcher_round.png — circular version
    await sharp(Buffer.from(ROUND_SVG)).resize(icon, icon).png()
      .toFile(path.join(target, 'ic_launcher_round.png'))
    console.log(`✓ ${folder}/ic_launcher_round.png (${icon}x${icon})`)

    // ic_launcher_foreground.png — CORRECT SIZE (108dp standard)
    await sharp(Buffer.from(FOREGROUND_SVG)).resize(foreground, foreground).png()
      .toFile(path.join(target, 'ic_launcher_foreground.png'))
    console.log(`✓ ${folder}/ic_launcher_foreground.png (${foreground}x${foreground})`)
  }

  console.log('\n🎉 Icons regenerated with CORRECT adaptive dimensions!')
  console.log('   Foreground sizes now follow Android spec (108dp standard)')
}

generate().catch(console.error)
