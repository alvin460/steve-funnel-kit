import Phaser from 'phaser'

import SoundManager from '../audio/SoundManager'
import { EventBus } from '../EventBus'
import { createNinjaTextures } from '../sprites/NinjaSprite'
import { createTypewriter } from '../ui/TypewriterText'
import { createMoon, createSky, createSkyline, createStars, getHintText } from './sceneUtils'

/**
 * Beat 3: "Your Shadow Clone"
 *
 * Introduces the AI assistant concept.
 * Ninja performs shadow clone jutsu — clone absorbs ALL context
 * (ICP, offer, voice, story), then drafts a reply. Original approves.
 */

const DIALOG_TEXT =
    'TEACH IT WHO YOU SELL TO. YOUR OFFER.\nYOUR VOICE. YOUR STORY. IT DRAFTS\nMESSAGES, TRIAGES YOUR PIPELINE, AND\nRESEARCHES YOUR LEADS. YOUR SHADOW CLONE.'

const AI_CONTEXT_FIELDS = [
    { label: 'YOUR ICP', x: 245, y: 180 },
    { label: 'YOUR OFFER', x: 415, y: 180 },
    { label: 'YOUR VOICE', x: 245, y: 225 },
    { label: 'YOUR STORY', x: 415, y: 225 },
]

const T = {
    NINJA: 600,
    CLONE_JUTSU: 1800,
    CONTEXT: 2800,
    DIALOG: 4200,
}

export default class ShadowCloneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'ShadowCloneScene' })
    }

    async init() {
        await document.fonts.ready
    }

    preload() {
        if (!this.textures.exists('ninja-idle')) {
            createNinjaTextures(this)
        }
    }

    create() {
        this.phase = 'cinematic'
        this.typewriter = null
        this.typewriterDone = false
        this.sound_mgr = SoundManager.getInstance()

        createSky(this)
        createMoon(this, 200, 80)
        createStars(this)
        createSkyline(this)

        this.runCinematic()
        this.setupInput()

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Original ninja appears center-right
        this.time.delayedCall(T.NINJA, () => {
            this.ninja = this.add
                .image(600, 350, 'ninja-idle')
                .setScale(4)
                .setOrigin(0.5, 1)
                .setDepth(5)
                .setAlpha(0)

            this.tweens.add({
                targets: this.ninja,
                alpha: 1,
                duration: 400,
            })
        })

        // Shadow clone jutsu
        this.time.delayedCall(T.CLONE_JUTSU, () => {
            // Flash effect
            this.cameras.main.flash(150, 206, 241, 123, true)
            this.sound_mgr.playSFX('cloneJutsu')

            // Smoke puffs
            for (let i = 0; i < 8; i++) {
                const smoke = this.add
                    .circle(
                        400 + Phaser.Math.Between(-20, 20),
                        340 + Phaser.Math.Between(-10, 10),
                        Phaser.Math.Between(4, 10),
                        0x52525b,
                        0.5
                    )
                    .setDepth(6)

                this.tweens.add({
                    targets: smoke,
                    y: smoke.y - Phaser.Math.Between(15, 35),
                    alpha: 0,
                    scale: { from: 1, to: 3 },
                    duration: 600,
                    delay: i * 40,
                    onComplete: () => smoke.destroy(),
                })
            }

            // Clone appears (ghost tint)
            this.clone = this.add
                .image(400, 350, 'ninja-idle')
                .setScale(4)
                .setOrigin(0.5, 1)
                .setDepth(5)
                .setAlpha(0)
                .setTint(0xaaddff)

            this.tweens.add({
                targets: this.clone,
                alpha: 0.7,
                duration: 400,
                delay: 200,
                onStart: () => this.sound_mgr.playSFX('cloneAppear'),
            })

            // "YOUR AI CLONE" label below clone
            const cloneLabel = this.add
                .text(400, 362, 'YOUR AI CLONE', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '8px',
                    color: '#CEF17B',
                    resolution: 4,
                })
                .setOrigin(0.5, 0)
                .setDepth(6)
                .setAlpha(0)

            this.tweens.add({
                targets: cloneLabel,
                alpha: 1,
                duration: 400,
                delay: 600,
            })

            // Ghost glow behind clone
            this.cloneGlow = this.add
                .circle(400, 330, 35, 0xcef17b, 0)
                .setDepth(4)

            this.tweens.add({
                targets: this.cloneGlow,
                alpha: { from: 0, to: 0.08 },
                duration: 600,
                delay: 200,
                yoyo: true,
                repeat: -1,
            })
        })

        // AI context fields appear one by one (replacing single "VOICE PROFILE" scroll)
        this.time.delayedCall(T.CONTEXT, () => {
            AI_CONTEXT_FIELDS.forEach((ctx, i) => {
                this.time.delayedCall(i * 250, () => {
                    const cardBg = this.add.graphics().setDepth(6).setAlpha(0)
                    cardBg.fillStyle(0x1a1a2e, 0.9)
                    cardBg.fillRect(ctx.x, ctx.y, 150, 34)
                    cardBg.lineStyle(1, 0xcef17b, 0.5)
                    cardBg.strokeRect(ctx.x, ctx.y, 150, 34)

                    const cardLabel = this.add
                        .text(ctx.x + 75, ctx.y + 17, ctx.label, {
                            fontFamily: '"Press Start 2P"',
                            fontSize: '9px',
                            color: '#CEF17B',
                            resolution: 4,
                        })
                        .setOrigin(0.5, 0.5)
                        .setDepth(6)
                        .setAlpha(0)

                    this.sound_mgr.playSFX('contextAbsorb', { volume: 0.6 })
                    this.tweens.add({
                        targets: [cardBg, cardLabel],
                        alpha: 1,
                        y: '-=8',
                        duration: 300,
                        ease: 'Power2',
                    })
                })
            })

            // Clone starts "reading" context
            if (this.clone) this.clone.setTexture('ninja-talk')
        })

        // Dialog
        this.time.delayedCall(T.DIALOG, () => {
            this.phase = 'dialog'
            this.showDialogBox()
        })
    }

    showDialogBox() {
        const boxW = 620
        const boxH = 88
        const boxX = (960 - boxW) / 2
        const boxY = 420

        const portraitBg = this.add.graphics().setDepth(9)
        portraitBg.fillStyle(0x141428, 0.95)
        portraitBg.fillRect(boxX - 76, boxY + 4, 70, 70)
        portraitBg.lineStyle(2, 0xcef17b, 0.6)
        portraitBg.strokeRect(boxX - 76, boxY + 4, 70, 70)
        portraitBg.setAlpha(0)

        const portrait = this.add
            .image(boxX - 41, boxY + 39, 'ninja-talk')
            .setScale(4)
            .setOrigin(0.5, 0.5)
            .setDepth(9)
            .setAlpha(0)

        const dialogBg = this.add.graphics().setDepth(9)
        dialogBg.fillStyle(0x1a1a2e, 0.95)
        dialogBg.fillRect(boxX, boxY, boxW, boxH)
        dialogBg.lineStyle(2, 0xcef17b, 1)
        dialogBg.strokeRect(boxX, boxY, boxW, boxH)

        const elements = [dialogBg, portraitBg, portrait]
        elements.forEach((el) => {
            el.setAlpha(0)
            el.y = (el.y || 0) + 20
        })

        this.sound_mgr.playSFX('swoosh')
        this.tweens.add({
            targets: elements,
            alpha: 1,
            y: '-=20',
            duration: 300,
            ease: 'Power2',
        })

        this.typewriterDone = false
        this.typewriter = createTypewriter(this, boxX + 16, boxY + 16, DIALOG_TEXT, {
            fontSize: '8px',
            color: '#FFFFFF',
            wordWrapWidth: boxW - 32,
            lineSpacing: 10,
            speed: 28,
            onComplete: () => {
                this.typewriterDone = true
                const hint = this.add
                    .text(boxX + boxW - 16, boxY + boxH - 12, getHintText('CONTINUE'), {
                        fontFamily: '"Press Start 2P"',
                        fontSize: '8px',
                        color: '#CEF17B',
                        resolution: 4,
                    })
                    .setOrigin(1, 0.5)
                    .setDepth(10)

                this.tweens.add({
                    targets: hint,
                    alpha: { from: 0.4, to: 1 },
                    duration: 600,
                    yoyo: true,
                    repeat: -1,
                })
            },
        })
    }

    setupInput() {
        const advance = () => {
            if (this.phase !== 'dialog') return
            if (this.typewriter && !this.typewriterDone) {
                this.typewriter.skip()
            } else if (this.typewriterDone) {
                this.sound_mgr.playSFX('advance')
                EventBus.emit('beat-complete')
            }
        }
        this.input.on('pointerdown', advance)
        this.input.keyboard.on('keydown-ENTER', advance)
        this.input.keyboard.on('keydown-SPACE', advance)
    }

    shutdown() {
        this.tweens.killAll()
        this.time.removeAllEvents()
        if (this.typewriter) this.typewriter.destroy()
    }
}
