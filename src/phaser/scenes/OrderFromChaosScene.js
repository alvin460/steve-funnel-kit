import Phaser from 'phaser'

import SoundManager from '../audio/SoundManager'
import { EventBus } from '../EventBus'
import { createNinjaTextures } from '../sprites/NinjaSprite'
import { createTypewriter } from '../ui/TypewriterText'
import { createMoon, createSky, createSkyline, createStars, getHintText } from './sceneUtils'

/**
 * Beat 2: "Order from Chaos"
 *
 * Ninja demonstrates AI pipeline intelligence.
 * Conversations flow past -> ninja classifies, tags, and tracks freshness.
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
    { text: 'Sounds good, Tuesday?', stage: 1 },
    { text: 'Need help w/ ads', stage: 2 },
    { text: 'Got a question', stage: 3 },
    { text: 'Sent the contract', stage: 4 },
    { text: 'Deal signed!', stage: 5 },
]

const DIALOG_TEXT =
    "YOUR AI READS EVERY CONVERSATION.\nCLASSIFIES BY STAGE. TAGS THE ONES\nTHAT MATTER. SPOTS WHO'S GOING COLD.\nYOUR PIPELINE BUILDS ITSELF."

const T = {
    NINJA: 600,
    CONVEYOR_START: 1400,
    BADGES: 4000,
    DIALOG: 5500,
}

export default class OrderFromChaosScene extends Phaser.Scene {
    constructor() {
        super({ key: 'OrderFromChaosScene' })
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
        createMoon(this)
        createStars(this)
        createSkyline(this)

        this.runCinematic()
        this.setupInput()

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Ninja appears at right-third line near a workbench
        this.time.delayedCall(T.NINJA, () => {
            this.ninja = this.add
                .image(680, 340, 'ninja-idle')
                .setScale(4)
                .setOrigin(0.5, 1)
                .setDepth(5)
                .setAlpha(0)

            this.tweens.add({
                targets: this.ninja,
                alpha: 1,
                y: { from: 310, to: 340 },
                duration: 300,
                ease: 'Back.easeOut',
            })

            // Workbench (scroll table)
            const bench = this.add.graphics().setDepth(4)
            bench.fillStyle(0x1a1a2e, 1)
            bench.fillRect(570, 340, 220, 12)
            bench.lineStyle(2, 0x3f3f5e, 1)
            bench.strokeRect(570, 340, 220, 12)
        })

        // Messages flow across as a conveyor belt
        this.time.delayedCall(T.CONVEYOR_START, () => this.startConveyor())

        // Stage badges appear in a column
        this.time.delayedCall(T.BADGES, () => this.showStageBadges())

        // Dialog
        this.time.delayedCall(T.DIALOG, () => {
            this.phase = 'dialog'
            this.showDialogBox()
        })
    }

    startConveyor() {
        CONVEYOR_MESSAGES.forEach((msg, i) => {
            this.time.delayedCall(i * 280, () => {
                const stage = PIPELINE_STAGES[msg.stage]

                // Message card
                const card = this.add.container(-260, 260).setDepth(4)
                const bg = this.add.graphics()
                bg.fillStyle(0x1a1a2e, 1)
                bg.fillRect(0, 0, 220, 32)
                bg.lineStyle(1, stage.color, 0.5)
                bg.strokeRect(0, 0, 220, 32)

                const label = this.add.text(10, 8, msg.text, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '9px',
                    color: '#E8E8E8',
                    resolution: 4,
                })

                card.add([bg, label])

                // Slide across to ninja, then stamp and sort down
                this.sound_mgr.playSFX('conveyorSlide', { volume: 0.5 })
                this.tweens.add({
                    targets: card,
                    x: 580,
                    duration: 800,
                    ease: 'Power1',
                    onComplete: () => {
                        // Stamp effect
                        this.cameras.main.shake(50, 0.003)
                        this.sound_mgr.playSFX('stampBadge')

                        // Badge appears on the card
                        const badge = this.add.graphics().setDepth(6)
                        badge.fillStyle(stage.color, 1)
                        badge.fillRect(222, 2, 90, 28)
                        const badgeText = this.add
                            .text(267, 16, stage.label, {
                                fontFamily: '"Press Start 2P"',
                                fontSize: '8px',
                                color: '#0D0D0D',
                                resolution: 4,
                            })
                            .setOrigin(0.5, 0.5)
                            .setDepth(6)
                        card.add([badge, badgeText])

                        // Sort to left column
                        const targetY = 80 + msg.stage * 50
                        this.tweens.add({
                            targets: card,
                            x: 100,
                            y: targetY,
                            duration: 400,
                            delay: 200,
                            ease: 'Back.easeOut',
                            onStart: () => this.sound_mgr.playSFX('cardSort', { volume: 0.5 }),
                        })

                        // Ninja reacts
                        if (this.ninja) this.ninja.setTexture('ninja-confident')
                        this.time.delayedCall(200, () => {
                            if (this.ninja) this.ninja.setTexture('ninja-idle')
                        })
                    },
                })
            })
        })
    }

    showStageBadges() {
        PIPELINE_STAGES.forEach((s, i) => {
            const y = 80 + i * 50
            const badge = this.add.graphics().setDepth(7).setAlpha(0)
            badge.fillStyle(s.color, 0.3)
            badge.fillRect(80, y - 4, 350, 38)
            badge.lineStyle(1, s.color, 0.4)
            badge.strokeRect(80, y - 4, 350, 38)

            this.tweens.add({
                targets: badge,
                alpha: 1,
                duration: 200,
                delay: i * 60,
            })
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
                this.showClickHint(boxX + boxW - 16, boxY + boxH - 12)
            },
        })
    }

    showClickHint(x, y) {
        const hint = this.add
            .text(x, y, getHintText('CONTINUE'), {
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
