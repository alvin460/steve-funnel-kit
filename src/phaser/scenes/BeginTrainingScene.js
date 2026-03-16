import Phaser from 'phaser'

import SoundManager from '../audio/SoundManager'
import { EventBus } from '../EventBus'
import { createNinjaTextures } from '../sprites/NinjaSprite'
import { createTypewriter } from '../ui/TypewriterText'
import { createMoon, createSky, createSkyline, createStars, getHintText } from './sceneUtils'

/**
 * Beat 5: "Begin Training"
 *
 * Transition beat — hypes up Act 2.
 * Ninja in confident pose, checklist items float in as scrolls.
 * Click -> EventBus.emit('beat-complete') triggers START_TRAINING.
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
    CHECKLIST_START: 1600,
    DIALOG: 3800,
}

export default class BeginTrainingScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BeginTrainingScene' })
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
        createMoon(this, 800, 70)
        createStars(this)
        createSkyline(this)

        this.runCinematic()
        this.setupInput()

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Ninja appears center, confident pose
        this.time.delayedCall(T.NINJA, () => {
            this.ninja = this.add
                .image(480, 380, 'ninja-confident')
                .setScale(5)
                .setOrigin(0.5, 1)
                .setDepth(5)
                .setAlpha(0)

            this.tweens.add({
                targets: this.ninja,
                alpha: 1,
                y: { from: 360, to: 380 },
                duration: 400,
                ease: 'Back.easeOut',
            })

            // Glow behind ninja
            const glow = this.add
                .circle(480, 350, 50, 0xcef17b, 0)
                .setDepth(4)

            this.tweens.add({
                targets: glow,
                alpha: { from: 0, to: 0.06 },
                duration: 1000,
                yoyo: true,
                repeat: -1,
            })
        })

        // Checklist items float in as scroll items
        this.time.delayedCall(T.CHECKLIST_START, () => {
            CHECKLIST_ITEMS.forEach((item, i) => {
                const y = 100 + i * 55
                const container = this.add.container(-300, y).setDepth(6).setAlpha(0)

                // Scroll-style background
                const bg = this.add.graphics()
                bg.fillStyle(0x1a1a2e, 0.85)
                bg.fillRect(0, 0, 260, 40)
                bg.lineStyle(2, 0xcef17b, 0.4)
                bg.strokeRect(0, 0, 260, 40)

                // Step number
                const num = this.add.text(12, 12, `${i + 1}`, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '10px',
                    color: '#CEF17B',
                    resolution: 4,
                })

                // Label
                const label = this.add.text(36, 12, item.text, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '9px',
                    color: '#E8E8E8',
                    resolution: 4,
                })

                container.add([bg, num, label])

                this.tweens.add({
                    targets: container,
                    alpha: 1,
                    x: 100,
                    duration: 500,
                    delay: i * 200,
                    ease: 'Back.easeOut',
                    onStart: () => this.sound_mgr.playSFX('checklistItem'),
                })
            })
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
                    .text(boxX + boxW - 16, boxY + boxH - 12, getHintText('GET EARLY ACCESS'), {
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
