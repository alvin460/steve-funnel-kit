import Phaser from 'phaser'

import { EventBus } from '../../EventBus'
import { createTypewriter } from '../../ui/TypewriterText'
import { getHintText } from '../sceneUtils'

/**
 * Shared utilities for portrait mobile scenes (540×960).
 * Same visual language as desktop, adapted for vertical layout.
 */

// --- Haptic feedback (no-op if unsupported) ---

export function haptic(ms = 15) {
    try {
        navigator.vibrate?.(ms)
    } catch {
        // Unsupported — silent
    }
}

// --- Sky & atmosphere ---

// City skyline buildings: [x, width, height from bottom]
const BUILDINGS = [
    [0, 60, 120],
    [65, 45, 180],
    [115, 70, 100],
    [190, 40, 220],
    [235, 80, 150],
    [320, 55, 190],
    [380, 70, 160],
    [455, 50, 130],
    [510, 35, 170],
]

export function createSky(scene) {
    const key = 'sky-grad-m-' + scene.scene.key
    if (scene.textures.exists(key)) scene.textures.remove(key)
    const canvas = scene.textures.createCanvas(key, 1, 960)
    const ctx = canvas.getContext()
    const grad = ctx.createLinearGradient(0, 0, 0, 960)
    grad.addColorStop(0, '#050510')
    grad.addColorStop(0.4, '#0D1B2A')
    grad.addColorStop(1, '#1B2838')
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, 1, 960)
    canvas.refresh()
    scene.add.image(270, 480, key).setDisplaySize(540, 960).setDepth(0)
}

export function createMoon(scene, x = 400, y = 80) {
    scene.add.circle(x, y, 45, 0xfffde7, 0.06).setDepth(1)
    scene.add.circle(x, y, 34, 0xfffde7, 0.12).setDepth(1)
    scene.add.circle(x, y, 26, 0xfffde7, 1).setDepth(1)
}

export function createStars(scene) {
    for (let i = 0; i < 40; i++) {
        const x = Phaser.Math.Between(10, 530)
        const y = Phaser.Math.Between(10, 500)
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

export function createSkyline(scene) {
    const container = scene.add.container(0, 0).setDepth(3)
    const g = scene.add.graphics()

    BUILDINGS.forEach(([bx, bw, bh], i) => {
        const by = 960 - bh
        g.fillStyle(0x08080f, 1)
        g.fillRect(bx, by, bw, bh)
        g.fillStyle(0x0e0e18, 1)
        g.fillRect(bx - 2, by, bw + 4, 3)

        if (i % 2 === 0 && bh > 120) {
            const cols = Math.floor(bw / 16)
            const rows = Math.floor(bh / 28)
            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {
                    if (Math.random() > 0.4) {
                        const wx = bx + 6 + c * 16
                        const wy = by + 12 + r * 28
                        g.fillStyle(0xff8f00, Math.random() * 0.15 + 0.05)
                        g.fillRect(wx, wy, 5, 7)
                    }
                }
            }
        }
    })

    container.add(g)
    return container
}

// --- Phase transitions ---

export function fadeElements(scene, elements, duration = 300, onComplete) {
    const valid = (Array.isArray(elements) ? elements : [elements]).filter(Boolean)
    if (valid.length === 0) { onComplete?.(); return }
    scene.tweens.add({
        targets: valid,
        alpha: 0,
        duration,
        onComplete: () => onComplete?.(),
    })
}

// --- Dust / smoke particles ---

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

export function spawnSmoke(scene, x, y) {
    for (let i = 0; i < 4; i++) {
        const smoke = scene.add
            .circle(
                x + Phaser.Math.Between(-10, 10),
                y + Phaser.Math.Between(-5, 5),
                Phaser.Math.Between(3, 7),
                0x52525b,
                0.4
            )
            .setDepth(6)

        scene.tweens.add({
            targets: smoke,
            y: smoke.y - Phaser.Math.Between(10, 25),
            alpha: 0,
            scale: { from: 1, to: 2.5 },
            duration: 500,
            ease: 'Power1',
            onComplete: () => smoke.destroy(),
        })
    }
}

// --- Beat text (replaces old dialog box) ---

/**
 * Show beat text centered in viewport over a dark overlay.
 * No box, no border, no ninja portrait — just clean text on dark sky.
 *
 * Returns { typewriter, isTypewriterDone } for scene to manage state.
 * opts.autoAdvance: boolean (default true) — show progress bar + auto-advance
 * opts.onTypewriterDone: callback when typewriter finishes
 * opts.hintAction: string for hint text (default 'CONTINUE')
 */
export function showBeatText(scene, text, opts = {}) {
    const {
        autoAdvance = true,
        onTypewriterDone,
        hintAction = 'CONTINUE',
    } = opts

    // Dark overlay dims everything behind
    const overlay = scene.add.graphics().setDepth(9).setAlpha(0)
    overlay.fillStyle(0x050510, 0.75)
    overlay.fillRect(0, 0, 540, 960)

    scene.tweens.add({
        targets: overlay,
        alpha: 1,
        duration: 400,
        ease: 'Power2',
    })

    // Typewriter text — upper-center of viewport, room for hint below
    const textX = 30
    const textY = 280
    let typewriterDone = false

    const typewriter = createTypewriter(scene, textX, textY, text, {
        fontSize: '16px',
        color: '#FFFFFF',
        wordWrapWidth: 480,
        lineSpacing: 16,
        speed: 28,
        onComplete: () => {
            typewriterDone = true

            // Hint text — well below text area
            const hint = scene.add
                .text(270, 680, getHintText(hintAction), {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '13px',
                    color: '#CEF17B',
                    resolution: 4,
                })
                .setOrigin(0.5, 0.5)
                .setDepth(10)

            scene.tweens.add({
                targets: hint,
                alpha: { from: 0.4, to: 1 },
                duration: 600,
                yoyo: true,
                repeat: -1,
            })

            // Auto-advance progress bar
            if (autoAdvance) {
                const barX = 30
                const barY = 710
                const barW = 480
                const barH = 4

                const barTrack = scene.add.graphics().setDepth(10)
                barTrack.fillStyle(0x3f3f5e, 1)
                barTrack.fillRect(barX, barY, barW, barH)

                const barFill = scene.add.graphics().setDepth(10)
                barFill.fillStyle(0xcef17b, 1)
                barFill.fillRect(barX, barY, 0, barH)

                const proxy = { progress: 0 }
                scene.autoAdvanceTimer = scene.tweens.add({
                    targets: proxy,
                    progress: 1,
                    duration: 3000,
                    ease: 'Linear',
                    onUpdate: () => {
                        barFill.clear()
                        barFill.fillStyle(0xcef17b, 1)
                        barFill.fillRect(barX, barY, barW * proxy.progress, barH)
                    },
                    onComplete: () => {
                        scene.autoAdvanceTimer = null
                        if (scene.onAutoAdvance) scene.onAutoAdvance()
                    },
                })
            }

            if (onTypewriterDone) onTypewriterDone()
        },
    })

    return {
        typewriter,
        isTypewriterDone: () => typewriterDone,
    }
}

// --- Input setup for mobile scenes ---

/**
 * Standard mobile input: tap to skip typewriter or advance.
 * scene must have: .typewriter, .dialog (from showDialog), .phase
 * opts.isFinalBeat: if true, emits beat-complete without fade
 */
export function setupMobileInput(scene, opts = {}) {
    const { isFinalBeat = false } = opts

    const advance = () => {
        if (scene.phase !== 'dialog') return

        if (scene.dialog?.typewriter && !scene.dialog.isTypewriterDone()) {
            scene.dialog.typewriter.skip()
        } else if (scene.dialog?.isTypewriterDone()) {
            // Cancel auto-advance timer if running
            if (scene.autoAdvanceTimer) {
                scene.autoAdvanceTimer.stop()
                scene.autoAdvanceTimer = null
            }

            scene.sound_mgr.playSFX('advance')
            haptic(15)

            if (isFinalBeat) {
                // Last beat: emit immediately (opens lead dialog)
                scene.cameras.main.fadeOut(300, 13, 13, 13)
                scene.cameras.main.once('camerafadeoutcomplete', () => {
                    scene.input.off('pointerdown', advance)
                    EventBus.emit('beat-complete')
                })
            } else {
                scene.cameras.main.fadeOut(300, 13, 13, 13)
                scene.cameras.main.once('camerafadeoutcomplete', () => {
                    scene.input.off('pointerdown', advance)
                    EventBus.emit('beat-complete')
                })
            }
        }
    }

    scene.input.on('pointerdown', advance)

    // Store the auto-advance callback
    scene.onAutoAdvance = () => {
        scene.sound_mgr.playSFX('advance')
        haptic(15)
        scene.cameras.main.fadeOut(300, 13, 13, 13)
        scene.cameras.main.once('camerafadeoutcomplete', () => {
            scene.input.off('pointerdown', advance)
                EventBus.emit('beat-complete')
        })
    }
}
