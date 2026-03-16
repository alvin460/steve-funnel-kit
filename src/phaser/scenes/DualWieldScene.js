import Phaser from 'phaser'

import SoundManager from '../audio/SoundManager'
import { EventBus } from '../EventBus'
import { createNinjaTextures } from '../sprites/NinjaSprite'
import { createTypewriter } from '../ui/TypewriterText'
import { createMoon, createSky, createStars, getHintText } from './sceneUtils'

/**
 * Beat 4: "The Dual Wield"
 *
 * Shows the Dashboard + AI Chat workflow.
 * Split screen: keyboard-driven dashboard on left, AI chat on right.
 * Positions the AI naturally — "just tell it what to do."
 */

const DIALOG_TEXT =
    'YOUR DASHBOARD IS KEYBOARD-DRIVEN.\nFILTERS. BULK ACTIONS. CAMPAIGN MODE.\nYOUR AI DOES THE HEAVY LIFTING.\nJUST TELL IT WHAT TO DO. PLAIN ENGLISH.'

const T = {
    DASHBOARD: 800,
    AI_CHAT: 1400,
    ARROWS: 2200,
    LINKEDIN: 3000,
    SYNC: 3600,
    DIALOG: 4800,
}

export default class DualWieldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DualWieldScene' })
    }

    preload() {
        if (!this.textures.exists('ninja-idle')) {
            createNinjaTextures(this)
        }
        // Load inline SVGs
        if (!this.textures.exists('ninja-icon')) {
            const ninjaIconUri =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzM0IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDMzNCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik03MS45Njk3IDE2Mi43MTFWMTA5LjczNUg5My43NTMyTDE5My44ODQgMTQxLjIyNEgxOTQuMTI2VjEwOS43MzVIMjE1LjkwOVYxNjIuNzExSDE5NC4xMjZMOTMuOTk1MiAxMzEuMjIySDkzLjc1MzJWMTYyLjcxMUg3MS45Njk3WiIgZmlsbD0iI0NFRjE3QiIvPgo8cGF0aCBkPSJNMTQzLjUxOSAwQzY0LjIzNjEgMCAwIDY0LjM1OCAwIDE0My43OTFDMCAyMjMuMjI0IDY0LjIzNjEgMjg3LjU4MiAxNDMuNTE5IDI4Ny41ODJDMjIyLjgwMSAyODcuNTgyIDI4Ny4wMzcgMjIzLjIyNCAyODcuMDM3IDE0My43OTFDMjg3LjAzNyAxMjkuMDc1IDI4NC44MjYgMTE0Ljg4MiAyODAuNzI5IDEwMS41MTdMMzE3LjcyIDEzMi4yM0wzMzMuMzMzIDk1Ljk1MTRMMjc2LjUwNSA4OS42Mzc0QzI3Ni4xMjggODguNzA5NyAyNzUuNzQ3IDg3Ljc4NzggMjc1LjM0NyA4Ni44NzE3TDMzMC4yNiA2My40MzAzTDMwNy4yOTIgMzEuMTAwNkwyNzIuMzMyIDgwLjMzMTVDMjQ4Ljk0MSAzMi43MzU2IDIwMC4wNTggMCAxNDMuNTE5IDBaTTY2Ljc4ODIgOTQuNTE5M0gyMTguNzMzQzI0My4yNDEgOTQuNTE5MyAyNTAuNTQ0IDEyMy4zNTkgMjQ5Ljg2NyAxNDMuMjE3QzI0OS4xODQgMTYzLjQxMSAyMjUuNjgzIDE4NS4yNyAyMDguMDY3IDE4NS4yN0MxNzIuNDMxIDE4NS4yNyAxNjUuNDYzIDE2MS45MzMgMTQyLjc2IDE2MS45MTVDMTIwLjA1OCAxNjEuOTMzIDExMy4wOSAxODUuMjcgNzcuNDUzNyAxODUuMjdDNTkuODM4IDE4NS4yNyAzNi4zMzY4IDE2My40MTEgMzUuNjUzOSAxNDMuMjE3QzM0Ljk3NjkgMTIzLjM1OSA0Mi4yODAxIDk0LjUxOTMgNjYuNzg4MiA5NC41MTkzWiIgZmlsbD0iI0NFRjE3QiIvPgo8L3N2Zz4K'
            this.load.image('ninja-icon', ninjaIconUri)
        }
    }

    async init() {
        await document.fonts.ready
    }

    create() {
        this.phase = 'cinematic'
        this.typewriter = null
        this.typewriterDone = false
        this.sound_mgr = SoundManager.getInstance()

        // Set LINEAR filter on SVG textures
        if (this.textures.exists('ninja-icon')) {
            this.textures.get('ninja-icon').setFilter(Phaser.Textures.FilterMode.LINEAR)
        }

        createSky(this)
        createMoon(this, 480, 60)
        createStars(this)

        this.runCinematic()
        this.setupInput()

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Left panel: Dashboard representation
        this.time.delayedCall(T.DASHBOARD, () => {
            const panel = this.add.container(140, 160).setDepth(4).setAlpha(0)

            const bg = this.add.graphics()
            bg.fillStyle(0x1a1a2e, 0.9)
            bg.fillRect(0, 0, 280, 200)
            bg.lineStyle(2, 0xcef17b, 0.5)
            bg.strokeRect(0, 0, 280, 200)

            // Ninja icon in panel header
            const icon = this.add
                .image(24, 16, 'ninja-icon')
                .setDisplaySize(22, 19)
                .setOrigin(0, 0)

            const title = this.add.text(52, 16, 'DASHBOARD', {
                fontFamily: '"Press Start 2P"',
                fontSize: '9px',
                color: '#CEF17B',
                resolution: 4,
            })

            // Mini pipeline list
            const stages = ['OPENING', 'CHATTING', 'QUALIFIED', 'DISCOVERY']
            const stageColors = [0x60a5fa, 0x8b5cf6, 0xf59e0b, 0x14b8a6]
            const rows = this.add.graphics()
            stages.forEach((s, i) => {
                const ry = 50 + i * 35
                rows.fillStyle(stageColors[i], 0.3)
                rows.fillRect(12, ry, 256, 28)
                rows.lineStyle(1, stageColors[i], 0.4)
                rows.strokeRect(12, ry, 256, 28)
            })
            const stageLabels = stages.map((s, i) =>
                this.add.text(20, 57 + i * 35, s, {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '8px',
                    color: '#E8E8E8',
                    resolution: 4,
                })
            )

            panel.add([bg, icon, title, rows, ...stageLabels])

            this.sound_mgr.playSFX('panelSlide')
            this.tweens.add({
                targets: panel,
                alpha: 1,
                x: { from: 80, to: 140 },
                duration: 400,
                ease: 'Power2',
            })
        })

        // Right panel: AI Chat representation
        this.time.delayedCall(T.AI_CHAT, () => {
            const chat = this.add.container(540, 160).setDepth(4).setAlpha(0)

            const bg = this.add.graphics()
            bg.fillStyle(0x1a1a2e, 0.9)
            bg.fillRect(0, 0, 280, 200)
            bg.lineStyle(2, 0x8b5cf6, 0.5)
            bg.strokeRect(0, 0, 280, 200)

            const title = this.add.text(12, 16, 'YOUR AI', {
                fontFamily: '"Press Start 2P"',
                fontSize: '9px',
                color: '#8B5CF6',
                resolution: 4,
            })

            // Chat bubbles
            const bubbles = this.add.graphics()
            // User message
            bubbles.fillStyle(0x3f3f5e, 0.5)
            bubbles.fillRect(80, 50, 188, 30)
            // AI response
            bubbles.fillStyle(0x8b5cf6, 0.2)
            bubbles.fillRect(12, 90, 220, 40)
            // User follow up
            bubbles.fillStyle(0x3f3f5e, 0.5)
            bubbles.fillRect(100, 140, 168, 24)

            const userMsg = this.add.text(88, 57, 'triage my pipeline', {
                fontFamily: '"Press Start 2P"',
                fontSize: '8px',
                color: '#E8E8E8',
                resolution: 4,
            })
            const aiMsg = this.add.text(20, 98, '12 hot leads. 3 going\ncold. Drafting replies...', {
                fontFamily: '"Press Start 2P"',
                fontSize: '8px',
                color: '#C4B5FD',
                lineSpacing: 6,
                resolution: 4,
            })
            const userMsg2 = this.add.text(108, 147, 'research sarah m.', {
                fontFamily: '"Press Start 2P"',
                fontSize: '8px',
                color: '#E8E8E8',
                resolution: 4,
            })

            chat.add([bg, title, bubbles, userMsg, aiMsg, userMsg2])

            this.sound_mgr.playSFX('panelSlide')
            this.tweens.add({
                targets: chat,
                alpha: 1,
                x: { from: 600, to: 540 },
                duration: 400,
                ease: 'Power2',
            })
        })

        // Arrows bouncing between panels
        this.time.delayedCall(T.ARROWS, () => {
            const arrowR = this.add
                .text(470, 220, '\u2192', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '14px',
                    color: '#CEF17B',
                    resolution: 4,
                })
                .setOrigin(0.5, 0.5)
                .setDepth(5)
                .setAlpha(0)

            const arrowL = this.add
                .text(470, 260, '\u2190', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '14px',
                    color: '#8B5CF6',
                    resolution: 4,
                })
                .setOrigin(0.5, 0.5)
                .setDepth(5)
                .setAlpha(0)

            this.sound_mgr.playSFX('arrowBounce')
            this.tweens.add({ targets: arrowR, alpha: 1, duration: 300 })
            this.tweens.add({ targets: arrowL, alpha: 1, duration: 300, delay: 200 })

            // Bounce animation
            this.tweens.add({
                targets: arrowR,
                x: { from: 450, to: 490 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
            this.tweens.add({
                targets: arrowL,
                x: { from: 490, to: 450 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        })

        // LinkedIn icon flashes briefly
        this.time.delayedCall(T.LINKEDIN, () => {
            const liIcon = this.add
                .text(480, 140, 'in', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '12px',
                    color: '#0A66C2',
                    resolution: 4,
                })
                .setOrigin(0.5, 0.5)
                .setDepth(6)
                .setAlpha(0)

            const liBg = this.add
                .circle(480, 140, 18, 0x0a66c2, 0.2)
                .setDepth(5)
                .setAlpha(0)

            this.tweens.add({
                targets: [liIcon, liBg],
                alpha: { from: 0, to: 1 },
                duration: 300,
                yoyo: true,
                hold: 800,
            })
        })

        // Sync indicator
        this.time.delayedCall(T.SYNC, () => {
            const sync = this.add
                .text(480, 390, 'SYNCED', {
                    fontFamily: '"Press Start 2P"',
                    fontSize: '10px',
                    color: '#CEF17B',
                    resolution: 4,
                })
                .setOrigin(0.5, 0.5)
                .setDepth(5)
                .setAlpha(0)

            this.sound_mgr.playSFX('syncPulse')
            this.tweens.add({
                targets: sync,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
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
