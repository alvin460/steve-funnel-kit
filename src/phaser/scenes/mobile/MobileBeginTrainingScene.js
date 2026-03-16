import Phaser from 'phaser'

import SoundManager from '../../audio/SoundManager'
import { EventBus } from '../../EventBus'
import { createNinjaTextures } from '../../sprites/NinjaSprite'
import {
    createMoon,
    createSky,
    createSkyline,
    createStars,
    haptic,
    showBeatText,
    setupMobileInput,
    fadeElements,
} from './mobileSceneUtils'

/**
 * Mobile Beat 5: "Begin Training" (540×960 portrait)
 *
 * Sequential:
 *   1. Ninja hero shot (confident, centered, glowing)
 *   2. Fade ninja → checklist items appear one at a time, big
 *   3. Dialog (no auto-advance — tap opens lead capture)
 */

const CHECKLIST_ITEMS = [
    { text: 'CONNECT LINKEDIN' },
    { text: 'PICK YOUR AI' },
    { text: 'TEACH IT YOUR STYLE' },
    { text: 'MAKE $ ON LINKEDIN' },
]

const DIALOG_TEXT =
    'FOUR STEPS TO GO LIVE.\nCONNECT LINKEDIN. PICK YOUR AI.\nTEACH IT YOUR STYLE.\nTHEN MAKE $ ON LINKEDIN.'

const T = {
    NINJA: 600,
    FADE_NINJA: 2000,
    CHECKLIST_START: 2300,
    // 4 items × 600ms = 2400ms → ends at 4700
    FADE_CHECKLIST: 5400,
    BEAT_TEXT: 5800,
}

export default class MobileBeginTrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileBeginTrainingScene' })
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
        createMoon(this, 400, 70)
        createStars(this)
        createSkyline(this)

        this.runCinematic()
        setupMobileInput(this, { isFinalBeat: true })

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Phase 1: Ninja hero (confident, centered)
        this.time.delayedCall(T.NINJA, () => this.showNinja())

        // Phase 2: Fade ninja → checklist
        this.time.delayedCall(T.FADE_NINJA, () => {
            fadeElements(this, [this.ninja, this.glow], 400)
        })
        this.time.delayedCall(T.CHECKLIST_START, () => this.showChecklist())

        // Phase 3: Fade checklist → beat text (no auto-advance)
        this.time.delayedCall(T.FADE_CHECKLIST, () => {
            fadeElements(this, this.checklistEls, 400)
        })
        this.time.delayedCall(T.BEAT_TEXT, () => {
            this.phase = 'dialog'
            this.dialog = showBeatText(this, DIALOG_TEXT, {
                autoAdvance: false,
                hintAction: 'GET EARLY ACCESS',
            })
        })
    }

    showNinja() {
        this.ninja = this.add
            .image(270, 520, 'ninja-confident')
            .setScale(10)
            .setOrigin(0.5, 1)
            .setDepth(5)
            .setAlpha(0)

        this.tweens.add({
            targets: this.ninja,
            alpha: 1,
            y: { from: 500, to: 520 },
            duration: 400,
            ease: 'Back.easeOut',
        })

        // Glow behind ninja
        this.glow = this.add.circle(270, 460, 100, 0xcef17b, 0).setDepth(4)
        this.tweens.add({
            targets: this.glow,
            alpha: { from: 0, to: 0.08 },
            duration: 1000,
            yoyo: true,
            repeat: -1,
        })
    }

    showChecklist() {
        this.checklistEls = []

        CHECKLIST_ITEMS.forEach((item, i) => {
            this.time.delayedCall(i * 600, () => {
                const y = 120 + i * 120
                const container = this.add.container(-500, y).setDepth(6).setAlpha(0)

                const cardH = 80
                const bg = this.add.graphics()
                bg.fillStyle(0x1a1a2e, 0.9)
                bg.fillRect(0, 0, 480, cardH)
                bg.lineStyle(2, 0xcef17b, 0.4)
                bg.strokeRect(0, 0, 480, cardH)

                const num = this.add.text(22, cardH / 2, `${i + 1}`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '28px',
                    color: '#CEF17B',
                    resolution: 4,
                }).setOrigin(0, 0.5)

                const label = this.add.text(70, cardH / 2, item.text, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '17px',
                    color: '#E8E8E8',
                    resolution: 4,
                }).setOrigin(0, 0.5)

                container.add([bg, num, label])
                this.checklistEls.push(container)

                this.tweens.add({
                    targets: container,
                    alpha: 1,
                    x: 30,
                    duration: 500,
                    ease: 'Back.easeOut',
                    onStart: () => this.sound_mgr.playSFX('checklistItem'),
                })
            })
        })
    }

    shutdown() {
        this.tweens.killAll()
        this.time.removeAllEvents()
        if (this.dialog?.typewriter) this.dialog.typewriter.destroy()
    }
}
