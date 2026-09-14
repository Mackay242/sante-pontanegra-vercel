/**
 * Generate Android app icons (mipmap-*) from the source SVG.
 * Android requires multiple sizes:
 *   mdpi:    48x48
 *   hdpi:    72x72
 *   xhdpi:   96x96
 *   xxhdpi:  144x144
 *   xxxhdpi: 192x192
 *   Play Store: 512x512
 */

import sharp from 'sharp'
import { mkdir, copyFile } from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

const ROOT = '/home/z/my-project'
const ANDROID_RES = path.join(ROOT, 'android/app/src/main/res')
const PLAY_STORE_DIR = path.join(ROOT, 'android/play-store')

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
  if (!existsSync(PLAY_STORE_DIR)) {
    await mkdir(PLAY_STORE_DIR, { recursive: true })
  }

  for (const { folder, size } of SIZES) {
    const targetFolder = path.join(ANDROID_RES, folder)
    if (!existsSync(targetFolder)) {
      await mkdir(targetFolder, { recursive: true })
    }

    // ic_launcher.png — full icon with background
    await sharp(Buffer.from(ICON_SVG))
      .resize(size, size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher.png'))
    console.log(`✓ ${folder}/ic_launcher.png (${size}x${size})`)

    // ic_launcher_round.png — round version
    await sharp(Buffer.from(ICON_SVG))
      .resize(size, size)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_round.png'))
    console.log(`✓ ${folder}/ic_launcher_round.png (${size}x${size})`)

    // ic_launcher_foreground.png — transparent background (for adaptive icon)
    const foregroundSize = Math.round(size * 1.5) // foreground is 108dp while icon is 72dp
    await sharp(Buffer.from(FOREGROUND_SVG))
      .resize(foregroundSize, foregroundSize)
      .png()
      .toFile(path.join(targetFolder, 'ic_launcher_foreground.png'))
    console.log(`✓ ${folder}/ic_launcher_foreground.png (${foregroundSize}x${foregroundSize})`)
  }

  // Play Store icon (512x512)
  await sharp(Buffer.from(ICON_SVG))
    .resize(512, 512)
    .png()
    .toFile(path.join(PLAY_STORE_DIR, 'play-store-icon-512.png'))
  console.log('✓ play-store-icon-512.png (512x512)')

  // Splash screen background (simple solid color, 9-patch not needed)
  // Android uses @drawable/splash for splash screen background
  // We'll create a simple PNG with the gradient
  for (const orientation of ['port', 'land']) {
    for (const { folder, ..._ } of [
      { folder: `${orientation}-mdpi`, w: 320, h: 480 },
      { folder: `${orientation}-hdpi`, w: 480, h: 800 },
      { folder: `${orientation}-xhdpi`, w: 720, h: 1280 },
      { folder: `${orientation}-xxhdpi`, w: 1080, h: 1920 },
      { folder: `${orientation}-xxxhdpi`, w: 1440, h: 2560 },
    ]) {
      const target = path.join(ANDROID_RES, `drawable-${folder}`)
      if (!existsSync(target)) {
        await mkdir(target, { recursive: true })
      }
      const splashSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${_.w} ${_.h}" width="${_.w}" height="${_.h}">
        <rect width="${_.w}" height="${_.h}" fill="#0d7a5f"/>
        <g transform="translate(${(_.w - 200) / 2}, ${(_.h - 200) / 2})">
          <path d="M100 200c-44-28-88-60-88-112 0-31 25-56 56-56 19 0 35 9 31 25 4-16 12-25 31-25 31 0 56 25 56 56 0 53-44 84-88 112z" fill="white"/>
        </g>
      </svg>`
      await sharp(Buffer.from(splashSvg))
        .png()
        .toFile(path.join(target, 'splash.png'))
      console.log(`✓ drawable-${folder}/splash.png`)
    }
  }

  console.log('\n🎉 All Android icons and splash screens generated!')
  console.log(`   Resources: ${ANDROID_RES}`)
  console.log(`   Play Store: ${PLAY_STORE_DIR}`)
}

generateAndroidIcons().catch((err) => {
  console.error('Error:', err)
  process.exit(1)
})
