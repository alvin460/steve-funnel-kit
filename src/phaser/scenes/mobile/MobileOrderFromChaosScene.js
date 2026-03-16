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
 * Mobile Beat 2: "Order from Chaos" (540×960 portrait)
 *
 * Sequential:
 *   1. Messages appear one at a time, get stamped, fade out
 *   2. Clean pipeline view
 *   3. Beat text (centered, no box)
 */

const PIPELINE_STAGES = [
    { key: 'opening', color: 0x60a5fa, label: 'OPENING' },
    { key: 'chatting', color: 0x8b5cf6, label: 'CHATTING' },
    { key: 'qualified', color: 0xf59e0b, label: 'QUALIFIED' },
    { key: 'discovery', color: 0x14b8a6, label: 'DISCOVERY' },
    { key: 'closing', color: 0xf97316, label: 'CLOSING' },
    { key: 'won', color: 0x22c55e, label: 'WON' },
]

const CONVEYOR_MESSAGES = [
    { text: 'Nice post!', stage: 0 },
    { text: 'Thoughts on this?', stage: 1 },
    { text: 'Help w/ ads?', stage: 2 },
    { text: 'Lets book a call', stage: 3 },
    { text: 'Contract sent', stage: 4 },
    { text: 'Deal signed!', stage: 5 },
]

const BEAT_TEXT =
    "YOUR AI READS EVERY CONVERSATION.\nCLASSIFIES BY STAGE. TAGS THE\nONES THAT MATTER. SPOTS WHO'S\nGOING COLD. YOUR PIPELINE\nBUILDS ITSELF."

// Each message: 600ms (slide 300 + stamp + fade 300)
// 6 messages × 600ms = 3600ms
const T = {
    CONVEYOR_START: 600,
    // 6 × 600ms = ends at 4200
    FADE_CONVEYOR: 4400,
    PIPELINE_VIEW: 4800,
    FADE_PIPELINE: 6800,
    BEAT_TEXT: 7200,
}

export default class MobileOrderFromChaosScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileOrderFromChaosScene' })
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
        createMoon(this)
        createStars(this)
        createSkyline(this)

        this.runCinematic()
        setupMobileInput(this)

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Phase 1: Messages stamped one at a time
        this.time.delayedCall(T.CONVEYOR_START, () => this.startConveyor())

        // Phase 2: Clean pipeline view
        this.time.delayedCall(T.PIPELINE_VIEW, () => this.showPipelineView())

        // Phase 3: Fade pipeline → beat text
        this.time.delayedCall(T.FADE_PIPELINE, () => {
            fadeElements(this, this.pipelineEls, 400)
        })
        this.time.delayedCall(T.BEAT_TEXT, () => {
            this.phase = 'dialog'
            this.dialog = showBeatText(this, BEAT_TEXT, { autoAdvance: true })
        })
    }

    startConveyor() {
        CONVEYOR_MESSAGES.forEach((msg, i) => {
            this.time.delayedCall(i * 600, () => {
                const stage = PIPELINE_STAGES[msg.stage]

                const card = this.add.container(-400, 380).setDepth(6)

                const bg = this.add.graphics()
                bg.fillStyle(0x1a1a2e, 1)
                bg.fillRect(0, 0, 480, 70)
                bg.lineStyle(2, stage.color, 0.5)
                bg.strokeRect(0, 0, 480, 70)

                const label = this.add.text(18, 22, msg.text, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '17px',
                    color: '#E8E8E8',
                    resolution: 4,
                })

                card.add([bg, label])

                // Slide to center
                this.sound_mgr.playSFX('conveyorSlide', { volume: 0.5 })
                this.tweens.add({
                    targets: card,
                    x: 30,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        // Stamp!
                        this.cameras.main.shake(50, 0.003)
                        this.sound_mgr.playSFX('stampBadge')
                        haptic(15)

                        const badge = this.add.graphics().setDepth(7)
                        badge.fillStyle(stage.color, 1)
                        badge.fillRect(300, 4, 176, 62)
                        const badgeText = this.add
                            .text(388, 35, stage.label, {
                                fontFamily: '"Press Start 2P"',
                                fontSize: '15px',
                                color: '#0D0D0D',
                                resolution: 4,
                            })
                            .setOrigin(0.5, 0.5)
                            .setDepth(7)
                        card.add([badge, badgeText])

                        // Fade out stamped card
                        this.tweens.add({
                            targets: card,
                            alpha: 0,
                            duration: 200,
                            delay: 100,
                            onComplete: () => card.destroy(),
                        })
                    },
                })
            })
        })
    }

    showPipelineView() {
        this.pipelineEls = []

        PIPELINE_STAGES.forEach((s, i) => {
            const y = 100 + i * 100
            const row = this.add.container(-500, y).setDepth(5).setAlpha(0)

            const bg = this.add.graphics()
            bg.fillStyle(s.color, 0.15)
            bg.fillRect(0, 0, 480, 90)
            bg.fillStyle(s.color, 1)
            bg.fillRect(0, 0, 6, 90)
            bg.lineStyle(1, s.color, 0.3)
            bg.strokeRect(0, 0, 480, 90)

            const label = this.add.text(24, 18, s.label, {
                fontFamily: '"Press Start 2P"',
                fontSize: '18px',
                color: '#' + s.color.toString(16).padStart(6, '0'),
                resolution: 4,
            })

            const msg = CONVEYOR_MESSAGES.find((m) => m.stage === i)
            const msgText = this.add.text(24, 54, msg ? `"${msg.text}"` : '', {
                fontFamily: '"Press Start 2P"',
                fontSize: '13px',
                color: '#a1a1aa',
                resolution: 4,
            })

            row.add([bg, label, msgText])
            this.pipelineEls.push(row)

            this.tweens.add({
                targets: row,
                x: 30,
                alpha: 1,
                duration: 400,
                delay: i * 80,
                ease: 'Back.easeOut',
                onStart: () => {
                    if (i === 0) this.sound_mgr.playSFX('cardSort', { volume: 0.5 })
                },
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
