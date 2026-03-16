import Phaser from 'phaser'

import SoundManager from '../../audio/SoundManager'
import { EventBus } from '../../EventBus'
import { createNinjaTextures } from '../../sprites/NinjaSprite'
import {
    createSky,
    createSkyline,
    haptic,
    showBeatText,
    setupMobileInput,
    spawnDust,
    fadeElements,
} from './mobileSceneUtils'

/**
 * Mobile Beat 1: "The DM Jungle" (540×960 portrait)
 *
 * Sequential — one visual idea per frame:
 *   1. Skyline + ninja hero
 *   2. Message flood + counter
 *   3. Shuriken slash clears chaos
 *   4. Title card
 *   5. Beat text (centered, no box)
 */

const MESSAGES = [
    { text: 'Hey nice post!', lead: true },
    { text: 'Lets book a call', lead: true },
    { text: 'Need help w/ leads', lead: true },
    { text: 'Great content!', lead: false },
]

const BEAT_TEXT =
    "363 UNREAD DMs. MOSTLY NOISE.\nLINKNINJA CLASSIFIES EVERY\nCONVERSATION INTO YOUR PIPELINE.\nAUTOMATICALLY."

const T = {
    SKYLINE: 600,
    NINJA: 1000,
    FADE_NINJA: 2800,
    MESSAGES: 3000,
    COUNTER: 3800,
    COUNTER_2: 4200,
    COUNTER_3: 4600,
    THROW: 5000,
    SLASH: 5300,
    TITLE: 5800,
    FADE_TITLE: 7800,
    BEAT_TEXT: 8200,
}

export default class MobileDMJungleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MobileDMJungleScene' })
    }

    preload() {
        const ninjaIconUri =
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzM0IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDMzNCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik03MS45Njk3IDE2Mi43MTFWMTA5LjczNUg5My43NTMyTDE5My44ODQgMTQxLjIyNEgxOTQuMTI2VjEwOS43MzVIMjE1LjkwOVYxNjIuNzExSDE5NC4xMjZMOTMuOTk1MiAxMzEuMjIySDkzLjc1MzJWMTYyLjcxMUg3MS45Njk3WiIgZmlsbD0iI0NFRjE3QiIvPgo8cGF0aCBkPSJNMTQzLjUxOSAwQzY0LjIzNjEgMCAwIDY0LjM1OCAwIDE0My43OTFDMCAyMjMuMjI0IDY0LjIzNjEgMjg3LjU4MiAxNDMuNTE5IDI4Ny41ODJDMjIyLjgwMSAyODcuNTgyIDI4Ny4wMzcgMjIzLjIyNCAyODcuMDM3IDE0My43OTFDMjg3LjAzNyAxMjkuMDc1IDI4NC44MjYgMTE0Ljg4MiAyODAuNzI5IDEwMS41MTdMMzE3LjcyIDEzMi4yM0wzMzMuMzMzIDk1Ljk1MTRMMjc2LjUwNSA4OS42Mzc0QzI3Ni4xMjggODguNzA5NyAyNzUuNzQ3IDg3Ljc4NzggMjc1LjM0NyA4Ni44NzE3TDMzMC4yNiA2My40MzAzTDMwNy4yOTIgMzEuMTAwNkwyNzIuMzMyIDgwLjMzMTVDMjQ4Ljk0MSAzMi43MzU2IDIwMC4wNTggMCAxNDMuNTE5IDBaTTY2Ljc4ODIgOTQuNTE5M0gyMTguNzMzQzI0My4yNDEgOTQuNTE5MyAyNTAuNTQ0IDEyMy4zNTkgMjQ5Ljg2NyAxNDMuMjE3QzI0OS4xODQgMTYzLjQxMSAyMjUuNjgzIDE4NS4yNyAyMDguMDY3IDE4NS4yN0MxNzIuNDMxIDE4NS4yNyAxNjUuNDYzIDE2MS45MzMgMTQyLjc2IDE2MS45MTVDMTIwLjA1OCAxNjEuOTMzIDExMy4wOSAxODUuMjcgNzcuNDUzNyAxODUuMjdDNTkuODM4IDE4NS4yNyAzNi4zMzY4IDE2My40MTEgMzUuNjUzOSAxNDMuMjE3QzM0Ljk3NjkgMTIzLjM1OSA0Mi4yODAxIDk0LjUxOTMgNjYuNzg4MiA5NC41MTkzWiIgZmlsbD0iI0NFRjE3QiIvPgo8L3N2Zz4K'
        const linkninjaLogoUri =
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODk3IiBoZWlnaHQ9IjEwNiIgdmlld0JveD0iMCAwIDg5NyAxMDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBIMjguMjM2NFY4MS45NTI2SDc4LjEyMDZWMTAzLjE2MkgwVjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODguODU1MSAwSDExNy4wOTFWMTAzLjE2Mkg4OC44NTUxVjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMzM0LjQ1NiAwSDM2Mi42OTJWNDEuODQyTDQwMS43NTMgMEg0MzQuNjk1TDM5Mi4wMjcgNDUuNDQ5MUw0MzYuMjY0IDEwMy4xNjJINDAzLjMyMUwzNzMuOTg3IDY0LjA2MTZMMzYyLjY5MiA3NS44OTI3VjEwMy4xNjJIMzM0LjQ1NlYwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQ0My44MzUgMTAzLjE2MlYwSDQ3Mi4wNzJMNTExLjI4OSA2MS4zMjAySDUxMS42MDJWMEg1MzkuODM5VjEwMy4xNjJINTExLjYwMkw0NzIuMzg1IDQxLjg0Mkg0NzIuMDcyVjEwMy4xNjJINDQzLjgzNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzcuMDkgMTAzLjE4MVYwLjAxODcxNzhIMTY1LjMyNkwyOTUuMTE4IDYxLjMzODlIMjk1LjQzMlYwLjAxODcxNzhIMzIzLjY2OFYxMDMuMTgxSDI5NS40MzJMMTY1LjY0IDQxLjg2MDdIMTY1LjMyNlYxMDMuMTgxSDEzNy4wOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik03ODQuNzI3IDY4LjgyMjlDNzg0LjcyNyA4OC43MzM5IDc3Ny4wNDEgMTA1LjQ3MSA3NDYuMjk0IDEwNS40NzFDNzE1LjU0OCAxMDUuNDcxIDcwNy44NjIgODguNzMzOSA3MDcuODYyIDY4LjgyMjlWNjAuMTY1OUg3MzIuOTZWNjguODIyOUM3MzIuOTYgNzguNjM0MSA3MzUuNDcgODQuMjYxMSA3NDQuNzI2IDg0LjI2MTFDNzUzLjk4MSA4NC4yNjExIDc1Ni40OTEgNzguNjM0MSA3NTYuNDkxIDY4LjgyMjlWMEg3ODQuNzI3VjY4LjgyMjlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODYxLjA0OSA4MS42NjRIODIyLjYxNkw4MTUuNCAxMDMuMTYySDc4Ny4xNjNMODI3Ljc5MiAwSDg1Ni4wMjlMODk2LjUwMSAxMDMuMTYySDg2OC4yNjVMODYxLjA0OSA4MS42NjRaTTgyOS4wNDcgNjEuODk3M0g4NTQuNzc0TDg0Mi4wNjggMjMuODA2N0g4NDEuNzU0TDgyOS4wNDcgNjEuODk3M1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik01OTkuNjE4IDEwMy4xNjJWMEg2MjcuODU1TDY2Ny4wNzIgNjEuMzIwMkg2NjcuMzg2VjBINjk1LjYyMlYxMDMuMTYySDY2Ny4zODZMNjI4LjE2OSA0MS44NDJINjI3Ljg1NVYxMDMuMTYySDU5OS42MThaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTU0LjUzNyAwLjAwNTcyMjE1SDU4Mi43NzNWMTAzLjE2OEg1NTQuNTM3VjAuMDA1NzIyMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'

        this.load.svg('ninja-icon', ninjaIconUri, { width: 200, height: 172 })
        this.load.svg('linkninja-logo', linkninjaLogoUri, { width: 460, height: 54 })
    }

    async init() {
        // Force-load Press Start 2P before any scene renders text
        await document.fonts.load('16px "Press Start 2P"')
        await document.fonts.ready
    }

    create() {
        this.phase = 'cinematic'
        this.dialog = null
        this.autoAdvanceTimer = null
        this.sound_mgr = SoundManager.getInstance()

        this.sound_mgr.startMusic('/onboarding-assets/audio/linkninja-theme.mp3')

        this.textures.get('ninja-icon').setFilter(Phaser.Textures.FilterMode.LINEAR)
        this.textures.get('linkninja-logo').setFilter(Phaser.Textures.FilterMode.LINEAR)

        createNinjaTextures(this)
        this.createShurikenTexture()

        // Persistent backdrop
        createSky(this)
        this.buildAtmosphere()

        this.runCinematic()
        setupMobileInput(this)

        EventBus.emit('current-scene-ready', this)
    }

    // --- Persistent atmosphere ---

    buildAtmosphere() {
        const mx = 400, my = 80
        this.add.circle(mx, my, 45, 0xfffde7, 0).setDepth(1)
        this.add.circle(mx, my, 34, 0xfffde7, 0).setDepth(1)
        const moonBody = this.add.circle(mx, my, 26, 0xfffde7, 0).setDepth(1)

        this.tweens.add({ targets: moonBody, alpha: 1, duration: 1000, delay: 200 })

        for (let i = 0; i < 40; i++) {
            const x = Phaser.Math.Between(10, 530)
            const y = Phaser.Math.Between(10, 500)
            const size = Phaser.Math.Between(1, 2)
            const star = this.add.rectangle(x, y, size, size, 0xffffff).setDepth(1).setAlpha(0)
            const baseAlpha = Phaser.Math.FloatBetween(0.3, 0.9)
            this.tweens.add({ targets: star, alpha: baseAlpha, duration: 600, delay: 400 + i * 20 })
            this.tweens.add({
                targets: star,
                alpha: { from: baseAlpha, to: Phaser.Math.FloatBetween(0.1, 0.3) },
                duration: Phaser.Math.Between(1500, 3500),
                yoyo: true,
                repeat: -1,
                delay: 1000 + i * 20 + Phaser.Math.Between(0, 2000),
            })
        }
    }

    createShurikenTexture() {
        if (this.textures.exists('shuriken')) return
        const size = 12
        const canvas = this.textures.createCanvas('shuriken', size, size)
        const ctx = canvas.getContext()
        const cx = size / 2, cy = size / 2

        ctx.fillStyle = '#C0C0C0'
        ctx.beginPath()
        for (let i = 0; i < 8; i++) {
            const r = i % 2 === 0 ? size / 2 - 1 : 2
            const angle = (i * Math.PI) / 4 - Math.PI / 2
            const px = cx + r * Math.cos(angle)
            const py = cy + r * Math.sin(angle)
            if (i === 0) ctx.moveTo(px, py)
            else ctx.lineTo(px, py)
        }
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#CEF17B'
        ctx.fillRect(cx - 1, cy - 1, 2, 2)
        canvas.refresh()
        this.textures.get('shuriken').setFilter(Phaser.Textures.FilterMode.NEAREST)
    }

    // --- Sequential timeline ---

    runCinematic() {
        // Phase 1: Skyline + ninja hero
        this.time.delayedCall(T.SKYLINE, () => this.showSkyline())
        this.time.delayedCall(T.NINJA, () => this.dropNinja())

        // Phase 2: Fade hero → message chaos + counter
        this.time.delayedCall(T.FADE_NINJA, () => {
            fadeElements(this, [this.ninja, this.headband, this.skyline], 400)
        })
        this.time.delayedCall(T.MESSAGES, () => this.showMessages())
        this.time.delayedCall(T.COUNTER, () => this.showCounter())
        this.time.delayedCall(T.COUNTER_2, () => this.tickCounter(198))
        this.time.delayedCall(T.COUNTER_3, () => this.tickCounter(363))

        // Phase 3: Slash clears chaos → title card
        this.time.delayedCall(T.THROW, () => this.ninjaThrow())
        this.time.delayedCall(T.SLASH, () => this.slashImpact())
        this.time.delayedCall(T.TITLE, () => this.showTitle())

        // Phase 4: Fade title → beat text
        this.time.delayedCall(T.FADE_TITLE, () => {
            fadeElements(this, this.titleEls, 400)
        })
        this.time.delayedCall(T.BEAT_TEXT, () => {
            this.phase = 'dialog'
            this.dialog = showBeatText(this, BEAT_TEXT, { autoAdvance: true })
        })
    }

    // --- Phase 1: Skyline + ninja ---

    showSkyline() {
        this.skyline = createSkyline(this)
        this.skyline.setAlpha(0)
        this.skyline.y = 40
        this.tweens.add({
            targets: this.skyline,
            alpha: 1,
            y: 0,
            duration: 600,
            ease: 'Power2',
        })
    }

    dropNinja() {
        const nx = 210, roofY = 740

        this.ninja = this.add
            .image(nx, roofY - 80, 'ninja-land')
            .setScale(7)
            .setOrigin(0.5, 1)
            .setDepth(5)

        this.tweens.add({
            targets: this.ninja,
            y: roofY,
            duration: 250,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.cameras.main.shake(150, 0.008)
                spawnDust(this, nx, roofY)
                this.sound_mgr.playSFX('ninjaLand')
                haptic(50)
                this.time.delayedCall(400, () => this.ninja?.setTexture('ninja-idle'))
            },
        })

        this.headband = this.add
            .rectangle(nx + 25, roofY - 50, 12, 4, 0xcef17b)
            .setDepth(5)
            .setAlpha(0)

        this.time.delayedCall(500, () => {
            if (!this.headband) return
            this.headband.setAlpha(1)
            this.tweens.add({
                targets: this.headband,
                x: this.headband.x + 4,
                angle: { from: -5, to: 5 },
                duration: 800,
                yoyo: true,
                repeat: -1,
                ease: 'Sine.easeInOut',
            })
        })
    }

    // --- Phase 2: Message chaos ---

    showMessages() {
        this.msgEls = []

        MESSAGES.forEach((msg, i) => {
            const y = 140 + i * 100
            const container = this.add.container(0, 0).setDepth(4)
            const w = 480, h = 60
            const borderColor = msg.lead ? 0x60a5fa : 0x27272a

            const bg = this.add.graphics()
            bg.fillStyle(msg.lead ? 0x1a1a2e : 0x141428, 1)
            bg.fillRect(0, 0, w, h)
            bg.lineStyle(2, borderColor, msg.lead ? 0.6 : 0.3)
            bg.strokeRect(0, 0, w, h)

            const avatar = this.add.graphics()
            avatar.fillStyle(msg.lead ? 0x60a5fa : 0x52525b, 1)
            avatar.fillRect(8, 8, 44, 44)

            const label = this.add.text(64, 18, msg.text, {
                fontFamily: '"Press Start 2P"',
                fontSize: '16px',
                color: msg.lead ? '#E8E8E8' : '#71717a',
                resolution: 4,
            })

            container.add([bg, avatar, label])
            container.setPosition(i % 2 === 0 ? -500 : 540, y).setAlpha(0)
            this.msgEls.push(container)

            this.tweens.add({
                targets: container,
                x: 30,
                alpha: 1,
                duration: 400,
                delay: i * 120,
                ease: 'Power2',
                onStart: () => {
                    this.sound_mgr.playSFX('messagePop', {
                        volume: 0.5,
                        rate: 0.9 + Math.random() * 0.2,
                    })
                },
            })
        })
    }

    showCounter() {
        // Dark overlay dims messages behind counter
        this.counterOverlay = this.add.graphics().setDepth(6).setAlpha(0)
        this.counterOverlay.fillStyle(0x0d0d0d, 0.7)
        this.counterOverlay.fillRect(0, 0, 540, 960)
        this.msgEls.push(this.counterOverlay)

        // Counter panel — big and centered
        this.counterBg = this.add.graphics().setDepth(7).setAlpha(0)
        this.counterBg.fillStyle(0x1a1a2e, 0.95)
        this.counterBg.fillRect(70, 320, 400, 160)
        this.counterBg.lineStyle(2, 0xcef17b, 0.4)
        this.counterBg.strokeRect(70, 320, 400, 160)

        this.counterLabel = this.add
            .text(270, 360, 'UNREAD DMs', {
                fontFamily: '"Press Start 2P"',
                fontSize: '18px',
                color: '#71717a',
                letterSpacing: 2,
                resolution: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(7)
            .setAlpha(0)

        this.counterText = this.add
            .text(270, 420, '87', {
                fontFamily: '"Press Start 2P"',
                fontSize: '48px',
                color: '#E8E8E8',
                resolution: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(7)
            .setAlpha(0)

        this.msgEls.push(this.counterBg, this.counterLabel, this.counterText)

        this.tweens.add({
            targets: [this.counterOverlay, this.counterBg, this.counterLabel, this.counterText],
            alpha: 1,
            duration: 300,
        })
        this.tweens.add({
            targets: this.counterText,
            scale: { from: 1.5, to: 1 },
            duration: 250,
            ease: 'Back.easeOut',
        })
        this.sound_mgr.playSFX('counterTick', { volume: 0.4 })
    }

    tickCounter(count) {
        if (!this.counterText) return
        this.counterText.setText(String(count))
        this.sound_mgr.playSFX('counterTick', { volume: 0.4 })
        this.tweens.add({
            targets: this.counterText,
            scale: { from: 1.3, to: 1 },
            duration: 250,
            ease: 'Back.easeOut',
        })
        if (count >= 363) {
            this.counterText.setColor('#FF6B6B')
            this.time.delayedCall(600, () => this.counterText?.setColor('#E8E8E8'))
        }
    }

    // --- Phase 3: Slash ---

    ninjaThrow() {
        this.sound_mgr.playSFX('shurikenThrow')

        this.shuriken = this.add.image(540, 200, 'shuriken').setScale(4).setDepth(8)

        this.tweens.add({
            targets: this.shuriken,
            x: 270,
            y: 480,
            duration: 300,
            ease: 'Power2',
        })
        this.tweens.add({ targets: this.shuriken, angle: 720, duration: 300 })
    }

    slashImpact() {
        this.cameras.main.flash(200, 206, 241, 123, true)
        this.cameras.main.shake(200, 0.012)
        this.sound_mgr.playSFX('shurikenSlice')
        haptic(30)

        // Full-screen diagonal slash lines
        const slash = this.add.graphics().setDepth(9)
        slash.lineStyle(4, 0xcef17b, 1)
        slash.beginPath()
        slash.moveTo(480, 50)
        slash.lineTo(60, 900)
        slash.strokePath()

        const slash2 = this.add.graphics().setDepth(9)
        slash2.lineStyle(2, 0xffffff, 0.6)
        slash2.beginPath()
        slash2.moveTo(460, 70)
        slash2.lineTo(40, 880)
        slash2.strokePath()

        this.tweens.add({
            targets: [slash, slash2],
            alpha: 0,
            duration: 400,
            delay: 100,
            onComplete: () => {
                slash.destroy()
                slash2.destroy()
            },
        })

        if (this.shuriken) {
            this.shuriken.destroy()
            this.shuriken = null
        }

        // Scatter all message + counter elements
        if (this.msgEls) {
            this.msgEls.forEach((el) => {
                if (!el || el.active === false) return
                this.tweens.add({
                    targets: el,
                    alpha: 0,
                    duration: 400,
                })
            })
        }
    }

    // --- Phase 4: Title card ---

    showTitle() {
        this.titleEls = []
        const cx = 270, cy = 340

        // Icon: pre-rasterized at 200×172 via load.svg()
        const icon = this.add
            .image(cx, cy - 70, 'ninja-icon')
            .setOrigin(0.5, 0.5)
            .setDepth(9)
            .setAlpha(0)

        // Logo: pre-rasterized at 460×54 via load.svg()
        const logo = this.add
            .image(cx, cy + 55, 'linkninja-logo')
            .setOrigin(0.5, 0.5)
            .setDepth(9)
            .setAlpha(0)

        const subtitle = this.add
            .text(cx, cy + 115, 'AI-POWERED SALES PIPELINE\nFOR LINKEDIN DMs', {
                fontFamily: '"Press Start 2P"',
                fontSize: '15px',
                color: '#d4d4d8',
                resolution: 4,
                align: 'center',
                lineSpacing: 12,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(9)
            .setAlpha(0)

        this.titleEls = [icon, logo, subtitle]

        this.sound_mgr.playSFX('titleReveal')
        haptic(80)

        this.tweens.add({
            targets: icon,
            alpha: 1,
            y: { from: cy - 100, to: cy - 70 },
            duration: 400,
            ease: 'Back.easeOut',
        })

        this.tweens.add({
            targets: logo,
            alpha: 1,
            scale: { from: 0.8, to: 1 },
            duration: 300,
            delay: 250,
            ease: 'Back.easeOut',
        })

        this.tweens.add({ targets: subtitle, alpha: 1, duration: 400, delay: 500 })
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
