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
 * Mobile Beat 4: "The Dual Wield" (540×960 portrait)
 *
 * Sequential — one panel at a time:
 *   1. Dashboard panel (big, centered, full screen)
 *   2. Dashboard fades → AI Chat panel (big, centered)
 *   3. Connection flash → SYNCED
 *   4. Dialog
 */

const DIALOG_TEXT =
    'YOUR DASHBOARD IS KEYBOARD-DRIVEN.\nFILTERS. BULK ACTIONS. CAMPAIGN MODE.\nYOUR AI DOES THE HEAVY LIFTING.\nJUST TELL IT WHAT TO DO. PLAIN ENGLISH.'

const T = {
    DASHBOARD: 800,
    FADE_DASHBOARD: 2800,
    AI_CHAT: 3100,
    FADE_CHAT: 5100,
    SYNC: 5400,
    FADE_SYNC: 7000,
    BEAT_TEXT: 7400,
}

export default class MobileDualWieldScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileDualWieldScene' })
    }

    preload() {
        if (!this.textures.exists('ninja-idle')) createNinjaTextures(this)
        if (!this.textures.exists('ninja-icon')) {
            const ninjaIconUri =
                'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzM0IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDMzNCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik03MS45Njk3IDE2Mi43MTFWMTA5LjczNUg5My43NTMyTDE5My44ODQgMTQxLjIyNEgxOTQuMTI2VjEwOS43MzVIMjE1LjkwOVYxNjIuNzExSDE5NC4xMjZMOTMuOTk1MiAxMzEuMjIySDkzLjc1MzJWMTYyLjcxMUg3MS45Njk3WiIgZmlsbD0iI0NFRjE3QiIvPgo8cGF0aCBkPSJNMTQzLjUxOSAwQzY0LjIzNjEgMCAwIDY0LjM1OCAwIDE0My43OTFDMCAyMjMuMjI0IDY0LjIzNjEgMjg3LjU4MiAxNDMuNTE5IDI4Ny41ODJDMjIyLjgwMSAyODcuNTgyIDI4Ny4wMzcgMjIzLjIyNCAyODcuMDM3IDE0My43OTFDMjg3LjAzNyAxMjkuMDc1IDI4NC44MjYgMTE0Ljg4MiAyODAuNzI5IDEwMS41MTdMMzE3LjcyIDEzMi4yM0wzMzMuMzMzIDk1Ljk1MTRMMjc2LjUwNSA4OS42Mzc0QzI3Ni4xMjggODguNzA5NyAyNzUuNzQ3IDg3Ljc4NzggMjc1LjM0NyA4Ni44NzE3TDMzMC4yNiA2My40MzAzTDMwNy4yOTIgMzEuMTAwNkwyNzIuMzMyIDgwLjMzMTVDMjQ4Ljk0MSAzMi43MzU2IDIwMC4wNTggMCAxNDMuNTE5IDBaTTY2Ljc4ODIgOTQuNTE5M0gyMTguNzMzQzI0My4yNDEgOTQuNTE5MyAyNTAuNTQ0IDEyMy4zNTkgMjQ5Ljg2NyAxNDMuMjE3QzI0OS4xODQgMTYzLjQxMSAyMjUuNjgzIDE4NS4yNyAyMDguMDY3IDE4NS4yN0MxNzIuNDMxIDE4NS4yNyAxNjUuNDYzIDE2MS45MzMgMTQyLjc2IDE2MS45MTVDMTIwLjA1OCAxNjEuOTMzIDExMy4wOSAxODUuMjcgNzcuNDUzNyAxODUuMjdDNTkuODM4IDE4NS4yNyAzNi4zMzY4IDE2My40MTEgMzUuNjUzOSAxNDMuMjE3QzM0Ljk3NjkgMTIzLjM1OSA0Mi4yODAxIDk0LjUxOTMgNjYuNzg4MiA5NC41MTkzWiIgZmlsbD0iI0NFRjE3QiIvPgo8L3N2Zz4K'
            this.load.svg('ninja-icon', ninjaIconUri, { width: 200, height: 172 })
        }
    }

    async init() {
        await document.fonts.ready
    }

    create() {
        this.phase = 'cinematic'
        this.dialog = null
        this.autoAdvanceTimer = null
        this.sound_mgr = SoundManager.getInstance()

        if (this.textures.exists('ninja-icon')) {
            this.textures.get('ninja-icon').setFilter(Phaser.Textures.FilterMode.LINEAR)
        }

        this.cameras.main.fadeIn(400, 13, 13, 13)

        createSky(this)
        createMoon(this, 270, 60)
        createStars(this)

        this.runCinematic()
        setupMobileInput(this)

        EventBus.emit('current-scene-ready', this)
    }

    runCinematic() {
        // Phase 1: Dashboard (full screen)
        this.time.delayedCall(T.DASHBOARD, () => this.showDashboard())

        // Phase 2: Fade dashboard → AI Chat (full screen)
        this.time.delayedCall(T.FADE_DASHBOARD, () => fadeElements(this, this.dashEls, 400))
        this.time.delayedCall(T.AI_CHAT, () => this.showAIChat())

        // Phase 3: Fade chat → sync visual
        this.time.delayedCall(T.FADE_CHAT, () => fadeElements(this, this.chatEls, 400))
        this.time.delayedCall(T.SYNC, () => this.showSync())

        // Phase 4: Fade sync → beat text
        this.time.delayedCall(T.FADE_SYNC, () => {
            fadeElements(this, this.syncEls, 400)
        })
        this.time.delayedCall(T.BEAT_TEXT, () => {
            this.phase = 'dialog'
            this.dialog = showBeatText(this, DIALOG_TEXT, { autoAdvance: true })
        })
    }

    showDashboard() {
        this.dashEls = []
        const panel = this.add.container(20, 170).setDepth(4).setAlpha(0)
        this.dashEls.push(panel)

        const bg = this.add.graphics()
        bg.fillStyle(0x1a1a2e, 0.9)
        bg.fillRect(0, 0, 500, 460)
        bg.lineStyle(2, 0xcef17b, 0.5)
        bg.strokeRect(0, 0, 500, 460)

        // Header with ninja icon
        const icon = this.add
            .image(18, 14, 'ninja-icon')
            .setDisplaySize(52, 45)
            .setOrigin(0, 0)

        const title = this.add.text(80, 18, 'DASHBOARD', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#CEF17B',
            resolution: 4,
        })

        // Pipeline stage rows — bigger, more breathing room
        const stages = ['OPENING', 'CHATTING', 'QUALIFIED', 'DISCOVERY']
        const stageColors = [0x60a5fa, 0x8b5cf6, 0xf59e0b, 0x14b8a6]
        const counts = ['23', '14', '8', '5']
        const rows = this.add.graphics()

        stages.forEach((s, i) => {
            const ry = 60 + i * 96
            rows.fillStyle(stageColors[i], 0.15)
            rows.fillRect(12, ry, 476, 80)
            rows.fillStyle(stageColors[i], 1)
            rows.fillRect(12, ry, 6, 80)
            rows.lineStyle(1, stageColors[i], 0.3)
            rows.strokeRect(12, ry, 476, 80)
        })

        const stageLabels = stages.map((s, i) =>
            this.add.text(32, 82 + i * 96, s, {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#E8E8E8',
                resolution: 4,
            })
        )

        const countLabels = counts.map((c, i) =>
            this.add.text(460, 82 + i * 96, c, {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: '#' + stageColors[i].toString(16).padStart(6, '0'),
                resolution: 4,
            }).setOrigin(1, 0)
        )

        panel.add([bg, icon, title, rows, ...stageLabels, ...countLabels])

        this.sound_mgr.playSFX('panelSlide')
        this.tweens.add({
            targets: panel,
            alpha: 1,
            x: { from: -60, to: 20 },
            duration: 400,
            ease: 'Power2',
        })
    }

    showAIChat() {
        this.chatEls = []
        const chat = this.add.container(20, 170).setDepth(4).setAlpha(0)
        this.chatEls.push(chat)

        const bg = this.add.graphics()
        bg.fillStyle(0x1a1a2e, 0.9)
        bg.fillRect(0, 0, 500, 420)
        bg.lineStyle(2, 0x8b5cf6, 0.5)
        bg.strokeRect(0, 0, 500, 420)

        const title = this.add.text(16, 16, 'YOUR AI', {
            fontFamily: '"Press Start 2P"',
            fontSize: '18px',
            color: '#8B5CF6',
            resolution: 4,
        })

        // Chat bubbles — bigger with breathing room
        const bubbles = this.add.graphics()

        // User bubble (right-aligned)
        bubbles.fillStyle(0x3f3f5e, 0.5)
        bubbles.fillRect(120, 70, 368, 50)

        // AI response (left-aligned, bigger)
        bubbles.fillStyle(0x8b5cf6, 0.2)
        bubbles.fillRect(12, 140, 460, 80)

        // User follow-up
        bubbles.fillStyle(0x3f3f5e, 0.5)
        bubbles.fillRect(160, 240, 328, 50)

        // AI response 2
        bubbles.fillStyle(0x8b5cf6, 0.2)
        bubbles.fillRect(12, 310, 460, 80)

        const userMsg = this.add.text(134, 82, 'triage my pipeline', {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#E8E8E8',
            resolution: 4,
        })

        const aiMsg = this.add.text(26, 152, '12 hot leads. 3 going\ncold. Drafting replies...', {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#C4B5FD',
            lineSpacing: 10,
            resolution: 4,
        })

        const userMsg2 = this.add.text(174, 252, 'research sarah m.', {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#E8E8E8',
            resolution: 4,
        })

        const aiMsg2 = this.add.text(26, 322, 'VP Marketing at Acme.\nPosted about scaling.', {
            fontFamily: '"Press Start 2P"',
            fontSize: '15px',
            color: '#C4B5FD',
            lineSpacing: 10,
            resolution: 4,
        })

        chat.add([bg, title, bubbles, userMsg, aiMsg, userMsg2, aiMsg2])

        this.sound_mgr.playSFX('panelSlide')
        this.tweens.add({
            targets: chat,
            alpha: 1,
            x: { from: 120, to: 20 },
            duration: 400,
            ease: 'Power2',
        })
    }

    showSync() {
        this.syncEls = []

        const liBg = this.add.circle(270, 340, 50, 0x0a66c2, 0.3).setDepth(5).setAlpha(0)
        const liIcon = this.add
            .text(270, 340, 'in', {
                fontFamily: '"Press Start 2P"',
                fontSize: '32px',
                color: '#0A66C2',
                resolution: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(6)
            .setAlpha(0)

        this.syncEls.push(liBg, liIcon)

        this.tweens.add({
            targets: [liIcon, liBg],
            alpha: 1,
            duration: 300,
        })

        const sync = this.add
            .text(270, 430, 'SYNCED', {
                fontFamily: '"Press Start 2P"',
                fontSize: '26px',
                color: '#CEF17B',
                resolution: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(5)
            .setAlpha(0)

        this.syncEls.push(sync)

        this.time.delayedCall(400, () => {
            this.sound_mgr.playSFX('syncPulse')
            this.tweens.add({
                targets: sync,
                alpha: 1,
                duration: 300,
                ease: 'Power2',
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
