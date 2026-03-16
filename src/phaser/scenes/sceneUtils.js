import Phaser from 'phaser'

import { createTypewriter } from '../ui/TypewriterText'

/**
 * Shared scene utilities for onboarding cinematic beats.
 * All beats share the same visual language: night sky, stars, skyline.
 */

/** Device-aware hint text for scene CTAs. */
export function getHintText(action = 'CONTINUE') {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    return isTouch ? `\u25B6 TAP TO ${action}` : `\u25B6 PRESS ENTER TO ${action}`
}

// City skyline buildings: [x, width, height from bottom]
const BUILDINGS = [
    [0, 85, 105],
    [90, 60, 155],
    [155, 95, 85],
    [255, 50, 195],
    [310, 115, 125],
    [430, 75, 100],
    [510, 65, 175],
    [580, 100, 135],
    [685, 65, 215],
    [755, 90, 155],
    [850, 75, 110],
    [930, 35, 140],
]

/**
 * Create gradient night sky background.
 */
export function createSky(scene) {
    const key = 'sky-grad-' + scene.scene.key
    if (scene.textures.exists(key)) scene.textures.remove(key)
    const canvas = scene.textures.createCanvas(key, 1, 540)
    const ctx = canvas.getContext()
    const grad = ctx.createLinearGradient(0, 0, 0, 540)
    grad.addColorStop(0, '#050510')
    grad.addColorStop(0.5, '#0D1B2A')
    grad.addColorStop(1, '#1B2838')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1, 540)
    canvas.refresh()
    scene.add.image(480, 270, key).setDisplaySize(960, 540).setDepth(0)
}

/**
 * Create moon with glow.
 */
export function createMoon(scene, x = 740, y = 85) {
    scene.add.circle(x, y, 55, 0xfffde7, 0.06).setDepth(1)
    scene.add.circle(x, y, 42, 0xfffde7, 0.12).setDepth(1)
    scene.add.circle(x, y, 32, 0xfffde7, 1).setDepth(1)
}

/**
 * Create twinkling stars.
 */
export function createStars(scene) {
    for (let i = 0; i < 50; i++) {
        const x = Phaser.Math.Between(10, 950)
        const y = Phaser.Math.Between(10, 280)
        const size = Phaser.Math.Between(1, 2)
        const star = scene.add.rectangle(x, y, size, size, 0xffffff).setDepth(1)

        const baseAlpha = Phaser.Math.FloatBetween(0.3, 0.9)
        star.setAlpha(baseAlpha)
        scene.tweens.add({
            targets: star,
            alpha: { from: baseAlpha, to: Phaser.Math.FloatBetween(0.1, 0.3) },
            duration: Phaser.Math.Between(1500, 3500),
            yoyo: true,
            repeat: -1,
            delay: Phaser.Math.Between(0, 2000),
        })
    }
}

/**
 * Create city skyline silhouette with window lights.
 */
export function createSkyline(scene) {
    const container = scene.add.container(0, 0).setDepth(3)
    const g = scene.add.graphics()

    BUILDINGS.forEach(([bx, bw, bh], i) => {
        const by = 540 - bh
        g.fillStyle(0x08080f, 1)
        g.fillRect(bx, by, bw, bh)
        g.fillStyle(0x0e0e18, 1)
        g.fillRect(bx - 2, by, bw + 4, 3)

        if (i % 2 === 0 && bh > 100) {
            const cols = Math.floor(bw / 18)
            const rows = Math.floor(bh / 30)
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (Math.random() > 0.4) {
                        const wx = bx + 8 + c * 18
                        const wy = by + 15 + r * 30
                        g.fillStyle(0xff8f00, Math.random() * 0.15 + 0.05)
                        g.fillRect(wx, wy, 6, 8)
                    }
                }
            }
        }
    })

    container.add(g)
    return container
}

/**
 * Drop ninja onto rooftop with dust particles.
 * Returns { ninja, headband } references.
 */
export function dropNinja(scene, x = 717, rooftopY = 325, texture = 'ninja-idle') {
    const ninja = scene.add
        .image(x, rooftopY - 80, 'ninja-land')
        .setScale(4)
        .setOrigin(0.5, 1)
        .setDepth(5)

    scene.tweens.add({
        targets: ninja,
        y: rooftopY,
        duration: 250,
        ease: 'Bounce.easeOut',
        onComplete: () => {
            scene.cameras.main.shake(150, 0.008)
            spawnDust(scene, x, rooftopY)
            scene.time.delayedCall(400, () => ninja.setTexture(texture))
        },
    })

    const headband = scene.add
        .rectangle(x + 24, rooftopY - 48, 10, 3, 0xcef17b)
        .setDepth(5)
        .setAlpha(0)

    scene.time.delayedCall(500, () => {
        headband.setAlpha(1)
        scene.tweens.add({
            targets: headband,
            x: headband.x + 4,
            angle: { from: -5, to: 5 },
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut',
        })
    })

    return { ninja, headband }
}

/**
 * Spawn dust particles at a position.
 */
export function spawnDust(scene, x, y) {
    for (let i = 0; i < 6; i++) {
        const dust = scene.add
            .circle(x + Phaser.Math.Between(-8, 8), y - 2, Phaser.Math.Between(2, 5), 0x666666, 0.5)
            .setDepth(4)

        scene.tweens.add({
            targets: dust,
            x: dust.x + Phaser.Math.Between(-30, 30),
            y: dust.y - Phaser.Math.Between(5, 20),
            alpha: 0,
            scale: { from: 1, to: 2 },
            duration: 400,
            ease: 'Power2',
            onComplete: () => dust.destroy(),
        })
    }
}

/**
 * Show centered NES-style dialog box with typewriter text.
 * Returns the dialog elements for cleanup.
 */
export function showDialog(scene, text, { onComplete, boxY = 420, boxW = 620, boxH = 88 } = {}) {

    const boxX = (960 - boxW) / 2

    // Portrait area
    const portraitBg = scene.add.graphics().setDepth(9)
    portraitBg.fillStyle(0x141428, 0.95)
    portraitBg.fillRect(boxX - 76, boxY + 4, 70, 70)
    portraitBg.lineStyle(2, 0xcef17b, 0.6)
    portraitBg.strokeRect(boxX - 76, boxY + 4, 70, 70)
    portraitBg.setAlpha(0)

    const portrait = scene.add
        .image(boxX - 41, boxY + 39, 'ninja-talk')
        .setScale(4)
        .setOrigin(0.5, 0.5)
        .setDepth(9)
        .setAlpha(0)

    // Dialog background
    const dialogBg = scene.add.graphics().setDepth(9)
    dialogBg.fillStyle(0x1a1a2e, 0.95)
    dialogBg.fillRect(boxX, boxY, boxW, boxH)
    dialogBg.lineStyle(2, 0xcef17b, 1)
    dialogBg.strokeRect(boxX, boxY, boxW, boxH)

    // Slide up entrance
    const elements = [dialogBg, portraitBg, portrait]
    elements.forEach((el) => {
        el.setAlpha(0)
        el.y = (el.y || 0) + 20
    })

    scene.tweens.add({
        targets: elements,
        alpha: 1,
        y: '-=20',
        duration: 300,
        ease: 'Power2',
    })

    // Typewriter
    const typewriter = createTypewriter(scene, boxX + 16, boxY + 16, text, {
        fontSize: '8px',
        color: '#FFFFFF',
        wordWrapWidth: boxW - 32,
        lineSpacing: 10,
        speed: 28,
        onComplete: () => {
            // Click hint
            const hint = scene.add
                .text(boxX + boxW - 16, boxY + boxH - 12, getHintText('CONTINUE'), {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '8px',
                    color: '#CEF17B',
                    resolution: 4,
                })
                .setOrigin(1, 0.5)
                .setDepth(10)

            scene.tweens.add({
                targets: hint,
                alpha: { from: 0.4, to: 1 },
                duration: 600,
                yoyo: true,
                repeat: -1,
            })

            if (onComplete) onComplete()
        },
    })

    return { typewriter, elements: [...elements], boxX, boxY, boxW, boxH }
}
