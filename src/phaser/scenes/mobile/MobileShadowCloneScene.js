import Phaser from 'phaser'

import SoundManager from '../../audio/SoundManager'
import { EventBus } from '../../EventBus'
import { createNinjaTextures } from '../../sprites/NinjaSprite'
import {
    createMoon,
    createSky,
    createStars,
    haptic,
    showBeatText,
    setupMobileInput,
    fadeElements,
} from './mobileSceneUtils'

/**
 * Mobile Beat 3: "Your Shadow Clone" (540×960 portrait)
 *
 * Sequential:
 *   1. Your ninja, solo hero shot
 *   2. Clone jutsu — flash, smoke, clone appears
 *   3. Fade ninja/clone → context cards appear ONE AT A TIME, big, centered
 *   4. Dialog
 */

const DIALOG_TEXT =
    'TEACH IT WHO YOU SELL TO. YOUR OFFER.\nYOUR VOICE. YOUR STORY. IT DRAFTS\nMESSAGES, TRIAGES YOUR PIPELINE, AND\nRESEARCHES YOUR LEADS. YOUR SHADOW CLONE.'

const AI_CONTEXT_FIELDS = [
    { label: 'YOUR ICP', desc: 'Who you sell to' },
    { label: 'YOUR OFFER', desc: 'What you sell' },
    { label: 'YOUR VOICE', desc: 'How you sound' },
    { label: 'YOUR STORY', desc: 'Why they trust you' },
]

const T = {
    NINJA: 600,
    CLONE_JUTSU: 1800,
    FADE_CLONE: 3200,
    CONTEXT_START: 3500,
    // 4 cards × 700ms each = 2800ms → ends at 6300
    FADE_CARDS: 7000,
    BEAT_TEXT: 7400,
}

export default class MobileShadowCloneScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileShadowCloneScene' })
    }

    async init() {
        await document.fonts.ready
    }

    preload() {
        if (!this.textures.exists('ninja-idle')) createNinjaTextures(this)
    }

    create() {
        this.phase = 'cinematic'
        this.dialog = null
        this.autoAdvanceTimer = null
        this.sound_mgr = SoundManager.getInstance()

        this.cameras.main.fadeIn(400, 13, 13, 13)

        createSky(this)
        createMoon(this, 200, 80)
        createStars(this)

        this.runCinematic()
        setupMobileInput(this)

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Phase 1: Ninja solo
        this.time.delayedCall(T.NINJA, () => this.showNinja())

        // Phase 2: Clone jutsu
        this.time.delayedCall(T.CLONE_JUTSU, () => this.cloneJutsu())

        // Phase 3: Fade ninja/clone → context cards
        this.time.delayedCall(T.FADE_CLONE, () => this.fadeClonePhase())
        this.time.delayedCall(T.CONTEXT_START, () => this.showContextCards())

        // Phase 4: Fade cards → beat text
        this.time.delayedCall(T.FADE_CARDS, () => {
            fadeElements(this, this.cardEls, 400)
        })
        this.time.delayedCall(T.BEAT_TEXT, () => {
            this.phase = 'dialog'
            this.dialog = showBeatText(this, DIALOG_TEXT, { autoAdvance: true })
        })
    }

    showNinja() {
        this.ninja = this.add
            .image(270, 500, 'ninja-idle')
            .setScale(8)
            .setOrigin(0.5, 1)
            .setDepth(5)
            .setAlpha(0)

        this.tweens.add({
            targets: this.ninja,
            alpha: 1,
            duration: 400,
        })
    }

    cloneJutsu() {
        this.cameras.main.flash(150, 206, 241, 123, true)
        this.sound_mgr.playSFX('cloneJutsu')
        haptic(40)

        // Smoke puffs at clone position
        for (let i = 0; i < 8; i++) {
            const smoke = this.add
                .circle(
                    270 + Phaser.Math.Between(-40, 40),
                    470 + Phaser.Math.Between(-20, 20),
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

        // Move original ninja right
        this.tweens.add({
            targets: this.ninja,
            x: 370,
            duration: 300,
            delay: 100,
        })

        // Clone appears left with ghost tint
        this.clone = this.add
            .image(170, 500, 'ninja-idle')
            .setScale(8)
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

        // "YOUR AI CLONE" label
        this.cloneLabel = this.add
            .text(170, 515, 'YOUR AI CLONE', {
                fontFamily: '"Press Start 2P"',
                fontSize: '18px',
                color: '#CEF17B',
                resolution: 4,
            })
            .setOrigin(0.5, 0)
            .setDepth(6)
            .setAlpha(0)

        this.tweens.add({
            targets: this.cloneLabel,
            alpha: 1,
            duration: 400,
            delay: 600,
        })

        // Ghost glow behind clone
        this.cloneGlow = this.add.circle(170, 470, 50, 0xcef17b, 0).setDepth(4)
        this.tweens.add({
            targets: this.cloneGlow,
            alpha: { from: 0, to: 0.08 },
            duration: 600,
            delay: 200,
            yoyo: true,
            repeat: -1,
        })
    }

    fadeClonePhase() {
        fadeElements(this, [this.ninja, this.clone, this.cloneLabel, this.cloneGlow], 400)
    }

    showContextCards() {
        this.cardEls = []

        AI_CONTEXT_FIELDS.forEach((ctx, i) => {
            this.time.delayedCall(i * 700, () => {
                const y = 140 + i * 125

                const card = this.add.container(0, y).setDepth(6).setAlpha(0)

                const bg = this.add.graphics()
                bg.fillStyle(0x1a1a2e, 0.9)
                bg.fillRect(20, 0, 500, 100)
                bg.fillStyle(0xcef17b, 1)
                bg.fillRect(20, 0, 6, 100)
                bg.lineStyle(2, 0xcef17b, 0.4)
                bg.strokeRect(20, 0, 500, 100)

                const label = this.add.text(44, 20, ctx.label, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '22px',
                    color: '#CEF17B',
                    resolution: 4,
                })

                const desc = this.add.text(44, 66, ctx.desc, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '15px',
                    color: '#71717a',
                    resolution: 4,
                })

                card.add([bg, label, desc])
                this.cardEls.push(card)

                this.sound_mgr.playSFX('contextAbsorb', { volume: 0.6 })
                this.tweens.add({
                    targets: card,
                    alpha: 1,
                    y: y - 8,
                    duration: 400,
                    ease: 'Power2',
                })
            })
        })
    }

    shutdown() {
        this.tweens.killAll()
        this.time.removeAllEvents()
        if (this.dialog?.typewriter) this.dialog.typewriter.destroy()
        if (this.autoAdvanceTimer) {
            this.autoAdvanceTimer.stop()
            this.autoAdvanceTimer = null
        }
    }
}
