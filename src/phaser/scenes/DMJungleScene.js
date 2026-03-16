import Phaser from 'phaser'

import SoundManager from '../audio/SoundManager'
import { EventBus } from '../EventBus'
import { createNinjaTextures } from '../sprites/NinjaSprite'
import { createTypewriter } from '../ui/TypewriterText'
import { getHintText } from './sceneUtils'

/**
 * Beat 1: "The DM Jungle"
 *
 * Cinematic opening — feels like loading into a ninja game.
 *
 * Phase flow:
 *   moonrise → ninja lands on rooftop → messages pile up →
 *   shuriken slash sorts hot from cold → LINKNINJA title card →
 *   dialog with mission briefing → click to advance
 */

// --- LinkedIn messages mapped to pipeline stages ---
// stage: null = noise (fades away), otherwise sorts into vertical pipeline list
const MESSAGES = [
    { text: 'Hey nice post!', stage: 'opening' },
    { text: 'Lets book a call', stage: 'discovery' },
    { text: 'Thx for connecting', stage: null },
    { text: 'Need help w/ leads', stage: 'qualified' },
    { text: 'Great content!', stage: null },
    { text: 'Thoughts on this?', stage: 'chatting' },
    { text: 'Check my profile!', stage: null },
    { text: 'Sent the proposal', stage: 'closing' },
    { text: 'Congrats!', stage: null },
    { text: 'Lets do this!', stage: 'won' },
    { text: 'Love your work!', stage: null },
    { text: 'Great call today!', stage: null },
]

// Where messages pile up (chaotic cluster, left-center of screen)
// Top positions pushed down to clear transparent header overlay
const MSG_PILE = [
    { x: 60, y: 170 },
    { x: 280, y: 145 },
    { x: 140, y: 220 },
    { x: 40, y: 280 },
    { x: 320, y: 200 },
    { x: 190, y: 270 },
    { x: 420, y: 175 },
    { x: 90, y: 335 },
    { x: 350, y: 280 },
    { x: 210, y: 355 },
    { x: 450, y: 260 },
    { x: 120, y: 390 },
]

// Pipeline stages — vertical list, top to bottom (unique colors per stage)
const PIPELINE_STAGES = [
    { key: 'opening', color: 0x60a5fa, label: 'OPENING' },
    { key: 'chatting', color: 0x8b5cf6, label: 'CHATTING' },
    { key: 'qualified', color: 0xf59e0b, label: 'QUALIFIED' },
    { key: 'discovery', color: 0x14b8a6, label: 'DISCOVERY' },
    { key: 'closing', color: 0xf97316, label: 'CLOSING' },
    { key: 'won', color: 0x22c55e, label: 'WON' },
]

// Sorted position for each stage (x=60, stacked vertically)
// Y pushed down to clear transparent header overlay
const SORT_X = 60
const SORT_Y_START = 110
const SORT_Y_SPACING = 50

// City skyline buildings: [x, width, height from bottom]
const BUILDINGS = [
    [0, 85, 105],
    [90, 60, 155],
    [155, 95, 85],
    [255, 50, 195],
    [310, 115, 125],
    [430, 75, 100],
    [510, 65, 175],
    [580, 100, 135],
    [685, 65, 215], // ninja's building (tallest)
    [755, 90, 155],
    [850, 75, 110],
    [930, 35, 140],
]

const NINJA_BUILDING = 8 // index into BUILDINGS

// Cinematic timeline (ms)
const T = {
    MOON: 200,
    STARS: 500,
    SKYLINE: 900,
    NINJA_DROP: 1800,
    DUST: 2100,
    MESSAGES: 2800,
    COUNTER_47: 3400,
    COUNTER_83: 4000,
    COUNTER_126: 4600,
    NINJA_THROW: 5200,
    SLASH: 5600,
    SORT: 6000,
    CLEAR_STAGE: 8500, // animate out messages/skyline/ninja after user absorbs
    TITLE: 9200, // logo enters center stage
    DIALOG: 10600,
}

const DIALOG_TEXT =
    "363 UNREAD DMs. MOSTLY NOISE.\nLINKNINJA CLASSIFIES EVERY CONVERSATION\nINTO YOUR PIPELINE. AUTOMATICALLY.\nREADY FOR TRAINING, NINJA?"

export default class DMJungleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'DMJungleScene' })
    }

    preload() {
        // Inline SVGs as data URIs to avoid CSP/network issues
        const ninjaIconUri =
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzM0IiBoZWlnaHQ9IjI4OCIgdmlld0JveD0iMCAwIDMzNCAyODgiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik03MS45Njk3IDE2Mi43MTFWMTA5LjczNUg5My43NTMyTDE5My44ODQgMTQxLjIyNEgxOTQuMTI2VjEwOS43MzVIMjE1LjkwOVYxNjIuNzExSDE5NC4xMjZMOTMuOTk1MiAxMzEuMjIySDkzLjc1MzJWMTYyLjcxMUg3MS45Njk3WiIgZmlsbD0iI0NFRjE3QiIvPgo8cGF0aCBkPSJNMTQzLjUxOSAwQzY0LjIzNjEgMCAwIDY0LjM1OCAwIDE0My43OTFDMCAyMjMuMjI0IDY0LjIzNjEgMjg3LjU4MiAxNDMuNTE5IDI4Ny41ODJDMjIyLjgwMSAyODcuNTgyIDI4Ny4wMzcgMjIzLjIyNCAyODcuMDM3IDE0My43OTFDMjg3LjAzNyAxMjkuMDc1IDI4NC44MjYgMTE0Ljg4MiAyODAuNzI5IDEwMS41MTdMMzE3LjcyIDEzMi4yM0wzMzMuMzMzIDk1Ljk1MTRMMjc2LjUwNSA4OS42Mzc0QzI3Ni4xMjggODguNzA5NyAyNzUuNzQ3IDg3Ljc4NzggMjc1LjM0NyA4Ni44NzE3TDMzMC4yNiA2My40MzAzTDMwNy4yOTIgMzEuMTAwNkwyNzIuMzMyIDgwLjMzMTVDMjQ4Ljk0MSAzMi43MzU2IDIwMC4wNTggMCAxNDMuNTE5IDBaTTY2Ljc4ODIgOTQuNTE5M0gyMTguNzMzQzI0My4yNDEgOTQuNTE5MyAyNTAuNTQ0IDEyMy4zNTkgMjQ5Ljg2NyAxNDMuMjE3QzI0OS4xODQgMTYzLjQxMSAyMjUuNjgzIDE4NS4yNyAyMDguMDY3IDE4NS4yN0MxNzIuNDMxIDE4NS4yNyAxNjUuNDYzIDE2MS45MzMgMTQyLjc2IDE2MS45MTVDMTIwLjA1OCAxNjEuOTMzIDExMy4wOSAxODUuMjcgNzcuNDUzNyAxODUuMjdDNTkuODM4IDE4NS4yNyAzNi4zMzY4IDE2My40MTEgMzUuNjUzOSAxNDMuMjE3QzM0Ljk3NjkgMTIzLjM1OSA0Mi4yODAxIDk0LjUxOTMgNjYuNzg4MiA5NC41MTkzWiIgZmlsbD0iI0NFRjE3QiIvPgo8L3N2Zz4K'
        const linkninjaLogoUri =
            'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODk3IiBoZWlnaHQ9IjEwNiIgdmlld0JveD0iMCAwIDg5NyAxMDYiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxwYXRoIGQ9Ik0wIDBIMjguMjM2NFY4MS45NTI2SDc4LjEyMDZWMTAzLjE2MkgwVjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODguODU1MSAwSDExNy4wOTFWMTAzLjE2Mkg4OC44NTUxVjBaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNMzM0LjQ1NiAwSDM2Mi42OTJWNDEuODQyTDQwMS43NTMgMEg0MzQuNjk1TDM5Mi4wMjcgNDUuNDQ5MUw0MzYuMjY0IDEwMy4xNjJINDAzLjMyMUwzNzMuOTg3IDY0LjA2MTZMMzYyLjY5MiA3NS44OTI3VjEwMy4xNjJIMzM0LjQ1NlYwWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTQ0My44MzUgMTAzLjE2MlYwSDQ3Mi4wNzJMNTExLjI4OSA2MS4zMjAySDUxMS42MDJWMEg1MzkuODM5VjEwMy4xNjJINTExLjYwMkw0NzIuMzg1IDQxLjg0Mkg0NzIuMDcyVjEwMy4xNjJINDQzLjgzNVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMzcuMDkgMTAzLjE4MVYwLjAxODcxNzhIMTY1LjMyNkwyOTUuMTE4IDYxLjMzODlIMjk1LjQzMlYwLjAxODcxNzhIMzIzLjY2OFYxMDMuMTgxSDI5NS40MzJMMTY1LjY0IDQxLjg2MDdIMTY1LjMyNlYxMDMuMTgxSDEzNy4wOVoiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik03ODQuNzI3IDY4LjgyMjlDNzg0LjcyNyA4OC43MzM5IDc3Ny4wNDEgMTA1LjQ3MSA3NDYuMjk0IDEwNS40NzFDNzE1LjU0OCAxMDUuNDcxIDcwNy44NjIgODguNzMzOSA3MDcuODYyIDY4LjgyMjlWNjAuMTY1OUg3MzIuOTZWNjguODIyOUM3MzIuOTYgNzguNjM0MSA3MzUuNDcgODQuMjYxMSA3NDQuNzI2IDg0LjI2MTFDNzUzLjk4MSA4NC4yNjExIDc1Ni40OTEgNzguNjM0MSA3NTYuNDkxIDY4LjgyMjlWMEg3ODQuNzI3VjY4LjgyMjlaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNODYxLjA0OSA4MS42NjRIODIyLjYxNkw4MTUuNCAxMDMuMTYySDc4Ny4xNjNMODI3Ljc5MiAwSDg1Ni4wMjlMODk2LjUwMSAxMDMuMTYySDg2OC4yNjVMODYxLjA0OSA4MS42NjRaTTgyOS4wNDcgNjEuODk3M0g4NTQuNzc0TDg0Mi4wNjggMjMuODA2N0g4NDEuNzU0TDgyOS4wNDcgNjEuODk3M1oiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik01OTkuNjE4IDEwMy4xNjJWMEg2MjcuODU1TDY2Ny4wNzIgNjEuMzIwMkg2NjcuMzg2VjBINjk1LjYyMlYxMDMuMTYySDY2Ny4zODZMNjI4LjE2OSA0MS44NDJINjI3Ljg1NVYxMDMuMTYySDU5OS42MThaIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNNTU0LjUzNyAwLjAwNTcyMjE1SDU4Mi43NzNWMTAzLjE2OEg1NTQuNTM3VjAuMDA1NzIyMTVaIiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K'

        this.load.image('ninja-icon', ninjaIconUri)
        this.load.image('linkninja-logo', linkninjaLogoUri)
    }

    async init() {
        // Force-load Press Start 2P before any scene renders text
        await document.fonts.load('16px "Press Start 2P"')
        await document.fonts.ready
    }

    create() {
        this.phase = 'cinematic'
        this.cards = []
        this.typewriter = null
        this.typewriterDone = false
        this.sound_mgr = SoundManager.getInstance()

        // Background music — fades in quietly, ducks when SFX play
        this.sound_mgr.startMusic('/onboarding-assets/audio/linkninja-theme.mp3')

        // Set LINEAR filtering on SVG logos so they render crisp (not pixelated)
        this.textures.get('ninja-icon').setFilter(Phaser.Textures.FilterMode.LINEAR)
        this.textures.get('linkninja-logo').setFilter(Phaser.Textures.FilterMode.LINEAR)

        createNinjaTextures(this)
        this.createShurikenTexture()

        // Build layers (back to front via depth)
        this.createSky()
        this.createMoon()
        this.createStars()
        this.createClouds()
        this.createSkyline()

        // Run cinematic timeline
        this.runCinematic()
        this.setupInput()

        EventBus.emit('current-scene-ready', this)
    }

    // -------------------------------------------------------
    // SKY & ATMOSPHERE
    // -------------------------------------------------------

    createSky() {
        if (this.textures.exists('sky-grad')) this.textures.remove('sky-grad')
        const canvas = this.textures.createCanvas('sky-grad', 1, 540)
        const ctx = canvas.getContext()
        const grad = ctx.createLinearGradient(0, 0, 0, 540)
        grad.addColorStop(0, '#050510')
        grad.addColorStop(0.5, '#0D1B2A')
        grad.addColorStop(1, '#1B2838')
        ctx.fillStyle = grad
        ctx.fillRect(0, 0, 1, 540)
        canvas.refresh()

        this.add.image(480, 270, 'sky-grad').setDisplaySize(960, 540).setDepth(0)
    }

    createMoon() {
        // Outer glow
        this.moonGlow = this.add.circle(740, 85, 55, 0xfffde7, 0.06).setDepth(1).setAlpha(0)
        this.moonGlow2 = this.add.circle(740, 85, 42, 0xfffde7, 0.12).setDepth(1).setAlpha(0)
        // Moon body
        this.moon = this.add.circle(740, 85, 32, 0xfffde7, 1).setDepth(1).setAlpha(0)
    }

    createStars() {
        this.starGroup = []
        for (let i = 0; i < 50; i++) {
            const x = Phaser.Math.Between(10, 950)
            const y = Phaser.Math.Between(10, 280)
            const size = Phaser.Math.Between(1, 2)
            const star = this.add.rectangle(x, y, size, size, 0xffffff).setDepth(1).setAlpha(0)
            this.starGroup.push(star)
        }
    }

    createClouds() {
        this.cloudGroup = []
        const cloudData = [
            { x: -50, y: 120, w: 130, h: 18 },
            { x: 400, y: 80, w: 100, h: 14 },
            { x: 800, y: 150, w: 110, h: 16 },
        ]
        cloudData.forEach((c) => {
            const cloud = this.add.ellipse(c.x, c.y, c.w, c.h, 0x1b2838, 0.35).setDepth(2).setAlpha(0)
            this.cloudGroup.push(cloud)
        })
    }

    // -------------------------------------------------------
    // CITY SKYLINE
    // -------------------------------------------------------

    createSkyline() {
        this.skylineContainer = this.add.container(0, 0).setDepth(3).setAlpha(0)
        const g = this.add.graphics()

        BUILDINGS.forEach(([bx, bw, bh], i) => {
            const by = 540 - bh
            // Building body (very dark silhouette)
            g.fillStyle(0x08080f, 1)
            g.fillRect(bx, by, bw, bh)

            // Subtle roof edge
            g.fillStyle(0x0e0e18, 1)
            g.fillRect(bx - 2, by, bw + 4, 3)

            // Random window lights on some buildings
            if (i % 2 === 0 && bh > 100) {
                const cols = Math.floor(bw / 18)
                const rows = Math.floor(bh / 30)
                for (let r = 0; r < rows; r++) {
                    for (let c = 0; c < cols; c++) {
                        if (Math.random() > 0.4) {
                            const wx = bx + 8 + c * 18
                            const wy = by + 15 + r * 30
                            g.fillStyle(0xff8f00, Math.random() * 0.15 + 0.05)
                            g.fillRect(wx, wy, 6, 8)
                        }
                    }
                }
            }
        })

        this.skylineContainer.add(g)
    }

    // -------------------------------------------------------
    // SHURIKEN TEXTURE
    // -------------------------------------------------------

    createShurikenTexture() {
        if (this.textures.exists('shuriken')) return
        const size = 12
        const canvas = this.textures.createCanvas('shuriken', size, size)
        const ctx = canvas.getContext()
        const cx = size / 2
        const cy = size / 2

        // 4-pointed throwing star
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

        // Lime center dot
        ctx.fillStyle = '#CEF17B'
        ctx.fillRect(cx - 1, cy - 1, 2, 2)
        canvas.refresh()
        this.textures.get('shuriken').setFilter(Phaser.Textures.FilterMode.NEAREST)
    }

    // -------------------------------------------------------
    // CINEMATIC TIMELINE
    // -------------------------------------------------------

    runCinematic() {
        // --- Moon fade in ---
        this.time.delayedCall(T.MOON, () => {
            this.tweens.add({ targets: this.moon, alpha: 1, duration: 1200, ease: 'Sine.easeIn' })
            this.tweens.add({ targets: this.moonGlow, alpha: 0.06, duration: 1500 })
            this.tweens.add({ targets: this.moonGlow2, alpha: 0.12, duration: 1500 })
        })

        // --- Stars twinkle in ---
        this.time.delayedCall(T.STARS, () => {
            this.starGroup.forEach((star, i) => {
                const baseAlpha = Phaser.Math.FloatBetween(0.3, 0.9)
                this.tweens.add({
                    targets: star,
                    alpha: baseAlpha,
                    duration: 600,
                    delay: i * 30,
                })
                // Twinkle loop
                this.tweens.add({
                    targets: star,
                    alpha: { from: baseAlpha, to: Phaser.Math.FloatBetween(0.1, 0.3) },
                    duration: Phaser.Math.Between(1500, 3500),
                    yoyo: true,
                    repeat: -1,
                    delay: i * 30 + 600 + Phaser.Math.Between(0, 2000),
                })
            })
        })

        // --- Clouds drift in ---
        this.time.delayedCall(T.STARS, () => {
            this.cloudGroup.forEach((cloud) => {
                this.tweens.add({ targets: cloud, alpha: 0.35, duration: 1000 })
                this.tweens.add({
                    targets: cloud,
                    x: cloud.x + Phaser.Math.Between(60, 120),
                    duration: Phaser.Math.Between(25000, 40000),
                    yoyo: true,
                    repeat: -1,
                })
            })
        })

        // --- Skyline rises ---
        this.time.delayedCall(T.SKYLINE, () => {
            this.skylineContainer.y = 60
            this.skylineContainer.setAlpha(1)
            this.tweens.add({
                targets: this.skylineContainer,
                y: 0,
                duration: 800,
                ease: 'Power2',
            })
        })

        // --- Ninja drops onto rooftop ---
        this.time.delayedCall(T.NINJA_DROP, () => this.dropNinja())

        // --- Messages fly in ---
        this.time.delayedCall(T.MESSAGES, () => this.launchMessages())

        // --- Counter ticks ---
        this.time.delayedCall(T.COUNTER_47, () => this.showCounter(87))
        this.time.delayedCall(T.COUNTER_83, () => this.updateCounter(198))
        this.time.delayedCall(T.COUNTER_126, () => this.updateCounter(363))

        // --- Ninja throws shuriken ---
        this.time.delayedCall(T.NINJA_THROW, () => this.ninjaThrow())

        // --- Slash impact ---
        this.time.delayedCall(T.SLASH, () => this.slashImpact())

        // --- Sort messages ---
        this.time.delayedCall(T.SORT, () => this.sortMessages())

        // --- Clear stage (animate out messages, ninja, skyline) ---
        this.time.delayedCall(T.CLEAR_STAGE, () => this.clearStage())

        // --- Title card (center of screen) ---
        this.time.delayedCall(T.TITLE, () => this.showTitleCard())

        // --- Dialog ---
        this.time.delayedCall(T.DIALOG, () => {
            this.phase = 'dialog'
            this.showDialog()
        })
    }

    // -------------------------------------------------------
    // NINJA
    // -------------------------------------------------------

    dropNinja() {
        const b = BUILDINGS[NINJA_BUILDING]
        const rooftopY = 540 - b[2]
        const ninjaX = b[0] + b[1] / 2

        this.ninja = this.add
            .image(ninjaX, rooftopY - 120, 'ninja-land')
            .setScale(4)
            .setOrigin(0.5, 1)
            .setDepth(5)

        // Drop down
        this.tweens.add({
            targets: this.ninja,
            y: rooftopY,
            duration: 250,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                // Camera shake on landing
                this.cameras.main.shake(150, 0.008)
                this.spawnDust(ninjaX, rooftopY)
                this.sound_mgr.playSFX('ninjaLand')

                // Switch to idle after landing
                this.time.delayedCall(400, () => {
                    this.ninja.setTexture('ninja-idle')
                })
            },
        })

        // Headband flutter — small lime rectangle that waves
        this.headband = this.add
            .rectangle(ninjaX + 24, rooftopY - 48, 10, 3, 0xcef17b)
            .setDepth(5)
            .setAlpha(0)

        this.time.delayedCall(500, () => {
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

    spawnDust(x, y) {
        for (let i = 0; i < 6; i++) {
            const dust = this.add
                .circle(x + Phaser.Math.Between(-8, 8), y - 2, Phaser.Math.Between(2, 5), 0x666666, 0.5)
                .setDepth(4)

            this.tweens.add({
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

    // -------------------------------------------------------
    // LINKEDIN MESSAGES (fly in like projectiles)
    // -------------------------------------------------------

    launchMessages() {
        MESSAGES.forEach((msg, i) => {
            const target = MSG_PILE[i]
            const card = this.createMessageCard(msg)
            // Start off-screen left at random heights
            card.setPosition(-220, Phaser.Math.Between(100, 420))
            card.setAlpha(0)
            card.setDepth(4)

            this.cards.push({ container: card, stage: msg.stage, landed: false })

            // Fly in (no rotation — keeps pixels crisp)
            this.tweens.add({
                targets: card,
                x: Math.round(target.x),
                y: Math.round(target.y),
                alpha: 1,
                duration: 500,
                delay: i * 130,
                ease: 'Power2',
                onStart: () => {
                    this.sound_mgr.playSFX('messagePop', {
                        volume: 0.6,
                        rate: 0.9 + Math.random() * 0.2,
                    })
                },
                onComplete: () => {
                    this.cards[i].landed = true
                },
            })
        })
    }

    createMessageCard(msg) {
        const isLead = msg.stage !== null
        const stageDef = isLead ? PIPELINE_STAGES.find((s) => s.key === msg.stage) : null
        const borderColor = stageDef ? stageDef.color : 0x27272a

        const container = this.add.container(0, 0)
        const w = 200
        const h = 32

        // Sharp pixel rectangle
        const bg = this.add.graphics()
        bg.fillStyle(isLead ? 0x1a1a2e : 0x141428, 1)
        bg.fillRect(0, 0, w, h)
        bg.lineStyle(2, borderColor, isLead ? 0.6 : 0.3)
        bg.strokeRect(0, 0, w, h)

        // Square avatar (color matches stage)
        const avatarColor = stageDef ? stageDef.color : Phaser.Math.Between(0x4444aa, 0xaa44aa)
        const avatar = this.add.graphics()
        avatar.fillStyle(avatarColor, 1)
        avatar.fillRect(6, 6, 20, 20)

        const label = this.add.text(32, 10, msg.text, {
            fontFamily: '"Press Start 2P"',
            fontSize: '8px',
            color: isLead ? '#E8E8E8' : '#71717a',
            resolution: 4,
        })

        container.add([bg, avatar, label])

        if (isLead && this.renderer?.type === Phaser.WEBGL) {
            try {
                container.postFX?.addGlow(borderColor, 2, 0, false, 0.06, 8)
            } catch {
                // Canvas fallback
            }
        }

        return container
    }

    // -------------------------------------------------------
    // UNREAD COUNTER
    // -------------------------------------------------------

    showCounter(count) {
        this.counterBg = this.add.graphics().setDepth(7)
        this.counterBg.fillStyle(0x1a1a2e, 0.85)
        this.counterBg.fillRect(380, 75, 200, 50)
        this.counterBg.lineStyle(2, 0xcef17b, 0.3)
        this.counterBg.strokeRect(380, 75, 200, 50)
        this.counterBg.setAlpha(0)

        this.counterLabel = this.add
            .text(480, 88, 'UNREAD', {
                fontFamily: '"Press Start 2P"',
                fontSize: '7px',
                color: '#52525b',
                letterSpacing: 3,
                resolution: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(7)
            .setAlpha(0)

        this.counterText = this.add
            .text(480, 108, String(count), {
                fontFamily: '"Press Start 2P"',
                fontSize: '18px',
                color: '#E8E8E8',
                resolution: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(7)
            .setAlpha(0)

        // Fade in
        this.tweens.add({ targets: [this.counterBg, this.counterLabel, this.counterText], alpha: 1, duration: 300 })
        this.tweens.add({
            targets: this.counterText,
            scale: { from: 1.5, to: 1 },
            duration: 250,
            ease: 'Back.easeOut',
        })
        this.sound_mgr.playSFX('counterTick', { volume: 0.4 })
    }

    updateCounter(count) {
        if (!this.counterText) return
        this.counterText.setText(String(count))
        this.sound_mgr.playSFX('counterTick', { volume: 0.4 })
        this.tweens.add({
            targets: this.counterText,
            scale: { from: 1.4, to: 1 },
            duration: 250,
            ease: 'Back.easeOut',
        })
        // Red warning tint at 126
        if (count >= 363) {
            this.counterText.setColor('#FF6B6B')
            this.time.delayedCall(600, () => this.counterText.setColor('#E8E8E8'))
        }
    }

    // -------------------------------------------------------
    // SHURIKEN THROW
    // -------------------------------------------------------

    ninjaThrow() {
        if (!this.ninja) return
        this.ninja.setTexture('ninja-throw')
        this.sound_mgr.playSFX('shurikenThrow')

        const startX = this.ninja.x + 30
        const startY = this.ninja.y - 40

        this.shuriken = this.add.image(startX, startY, 'shuriken').setScale(3).setDepth(6)

        // Trail particles
        const trailTimer = this.time.addEvent({
            delay: 30,
            repeat: 12,
            callback: () => {
                if (!this.shuriken?.active) return
                const trail = this.add
                    .image(this.shuriken.x, this.shuriken.y, 'shuriken')
                    .setScale(this.shuriken.scale)
                    .setAlpha(0.3)
                    .setTint(0xcef17b)
                    .setDepth(6)
                this.tweens.add({
                    targets: trail,
                    alpha: 0,
                    scale: 1,
                    duration: 200,
                    onComplete: () => trail.destroy(),
                })
            },
        })

        // Fly across screen
        this.tweens.add({
            targets: this.shuriken,
            x: 250,
            y: 280,
            duration: 400,
            ease: 'Power2',
        })

        // Continuous spin
        this.tweens.add({
            targets: this.shuriken,
            angle: 720,
            duration: 400,
            ease: 'Linear',
        })
    }

    // -------------------------------------------------------
    // SLASH IMPACT
    // -------------------------------------------------------

    slashImpact() {
        // Screen flash + shake
        this.cameras.main.flash(200, 206, 241, 123, true) // lime flash
        this.cameras.main.shake(200, 0.012)
        this.sound_mgr.playSFX('shurikenSlice')

        // Draw slash arc
        const slash = this.add.graphics().setDepth(8)
        slash.lineStyle(4, 0xcef17b, 1)
        slash.beginPath()
        slash.moveTo(600, 100)
        slash.lineTo(350, 250)
        slash.lineTo(100, 420)
        slash.strokePath()

        // Second slash line
        const slash2 = this.add.graphics().setDepth(8)
        slash2.lineStyle(2, 0xffffff, 0.6)
        slash2.beginPath()
        slash2.moveTo(580, 120)
        slash2.lineTo(330, 270)
        slash2.lineTo(80, 400)
        slash2.strokePath()

        // Fade slashes
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

        // Destroy shuriken
        if (this.shuriken) {
            this.shuriken.destroy()
            this.shuriken = null
        }

        // Ninja back to idle
        if (this.ninja) {
            this.ninja.setTexture('ninja-idle')
        }
    }

    // -------------------------------------------------------
    // SORT MESSAGES (hot vs cold)
    // -------------------------------------------------------

    sortMessages() {
        this.stageBadges = []

        // Build a lookup: stage key → vertical position index
        const stageIndex = {}
        PIPELINE_STAGES.forEach((s, i) => {
            stageIndex[s.key] = i
        })

        // Sort each message
        let sortDelay = 0
        this.cards.forEach(({ container, stage }) => {
            if (stage && stageIndex[stage] !== undefined) {
                const idx = stageIndex[stage]
                const targetX = SORT_X
                const targetY = SORT_Y_START + idx * SORT_Y_SPACING

                this.tweens.add({
                    targets: container,
                    x: targetX,
                    y: targetY,
                    duration: 500,
                    ease: 'Back.easeOut',
                    delay: sortDelay,
                })
                sortDelay += 80
            } else {
                // Noise: smoke puff then fade
                this.spawnSmoke(container.x + 95, container.y + 14)
                this.tweens.add({
                    targets: container,
                    alpha: 0,
                    scale: 0.8,
                    duration: 300,
                    ease: 'Power2',
                })
            }
        })

        // Stage badges appear after messages land
        this.time.delayedCall(600, () => {
            PIPELINE_STAGES.forEach((s, i) => {
                const y = SORT_Y_START + i * SORT_Y_SPACING

                // Badge background
                const badge = this.add.graphics().setDepth(8).setAlpha(0)
                badge.fillStyle(s.color, 1)
                badge.fillRect(SORT_X + 204, y + 4, 80, 24)

                // Badge text
                const badgeText = this.add
                    .text(SORT_X + 244, y + 16, s.label, {
                        fontFamily: '"Press Start 2P"',
                        fontSize: '8px',
                        color: '#0D0D0D',
                        resolution: 4,
                    })
                    .setOrigin(0.5, 0.5)
                    .setDepth(8)
                    .setAlpha(0)

                this.stageBadges.push(badge, badgeText)

                this.tweens.add({
                    targets: [badge, badgeText],
                    alpha: 1,
                    duration: 200,
                    delay: i * 60,
                })
            })
        })

        // Fade counter
        if (this.counterBg) {
            this.tweens.add({
                targets: [this.counterBg, this.counterLabel, this.counterText],
                alpha: 0,
                duration: 400,
            })
        }

        // Ninja confident pose
        this.time.delayedCall(800, () => {
            if (this.ninja) this.ninja.setTexture('ninja-confident')
        })
    }

    spawnSmoke(x, y) {
        for (let i = 0; i < 4; i++) {
            const smoke = this.add
                .circle(
                    x + Phaser.Math.Between(-10, 10),
                    y + Phaser.Math.Between(-5, 5),
                    Phaser.Math.Between(3, 7),
                    0x52525b,
                    0.4
                )
                .setDepth(6)

            this.tweens.add({
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

    // -------------------------------------------------------
    // CLEAR STAGE (animate out messages, badges, ninja, skyline)
    // -------------------------------------------------------

    clearStage() {
        // Animate message cards off to the left
        this.cards.forEach(({ container, stage }, i) => {
            if (stage) {
                this.tweens.add({
                    targets: container,
                    x: -250,
                    alpha: 0,
                    duration: 400,
                    delay: i * 40,
                    ease: 'Power2',
                })
            }
        })

        // Animate stage badges off to the left
        if (this.stageBadges) {
            this.stageBadges.forEach((el, i) => {
                this.tweens.add({
                    targets: el,
                    alpha: 0,
                    duration: 300,
                    delay: i * 20,
                })
            })
        }

        // Fade out ninja + headband
        if (this.ninja) {
            this.tweens.add({ targets: this.ninja, alpha: 0, duration: 500 })
        }
        if (this.headband) {
            this.tweens.add({ targets: this.headband, alpha: 0, duration: 500 })
        }

        // Slide skyline down and fade
        if (this.skylineContainer) {
            this.tweens.add({
                targets: this.skylineContainer,
                y: 40,
                alpha: 0,
                duration: 600,
                ease: 'Power2',
            })
        }
    }

    // -------------------------------------------------------
    // TITLE CARD
    // -------------------------------------------------------

    showTitleCard() {
        // Vertically centered in the canvas (270 = true center of 540)
        const cx = 480
        const cy = 250

        // Ninja icon logo (334x288 native) — crisp via LINEAR filter
        const icon = this.add
            .image(cx, cy - 40, 'ninja-icon')
            .setOrigin(0.5, 0.5)
            .setDepth(9)
            .setAlpha(0)
            .setDisplaySize(130, 112)

        // LINKNINJA wordmark (897x106 native) — crisp via LINEAR filter
        const logo = this.add
            .image(cx, cy + 55, 'linkninja-logo')
            .setOrigin(0.5, 0.5)
            .setDepth(9)
            .setAlpha(0)
            .setDisplaySize(380, 45)

        // Subtitle
        const subtitle = this.add
            .text(cx, cy + 100, 'AI-POWERED SALES PIPELINE FOR LINKEDIN DMs', {
                fontFamily: '"Press Start 2P"',
                fontSize: '8px',
                color: '#d4d4d8',
                resolution: 4,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(9)
            .setAlpha(0)

        // Icon drops in from above
        this.sound_mgr.playSFX('titleReveal')
        this.tweens.add({
            targets: icon,
            alpha: 1,
            y: { from: cy - 70, to: cy - 40 },
            duration: 400,
            ease: 'Back.easeOut',
        })

        // Logo slams in with scale punch
        this.tweens.add({
            targets: logo,
            alpha: 1,
            scaleX: { from: 0.8, to: logo.scaleX },
            scaleY: { from: 0.8, to: logo.scaleY },
            duration: 300,
            delay: 250,
            ease: 'Back.easeOut',
        })

        // Subtitle fades in
        this.tweens.add({
            targets: subtitle,
            alpha: 1,
            duration: 400,
            delay: 500,
        })

        // These stay on screen — no fade out
    }

    // -------------------------------------------------------
    // DIALOG BOX
    // -------------------------------------------------------

    showDialog() {
        // Centered dialog — stage is clear
        const boxW = 620
        const boxH = 88
        const boxX = (960 - boxW) / 2
        const boxY = 420

        // Ninja portrait area (sharp pixel border)
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

        // Dialog background (sharp pixel border)
        const dialogBg = this.add.graphics().setDepth(9)
        dialogBg.fillStyle(0x1a1a2e, 0.95)
        dialogBg.fillRect(boxX, boxY, boxW, boxH)
        dialogBg.lineStyle(2, 0xcef17b, 1)
        dialogBg.strokeRect(boxX, boxY, boxW, boxH)

        // Slide up entrance
        const dialogElements = [dialogBg, portraitBg, portrait]
        dialogElements.forEach((el) => {
            el.setAlpha(0)
            el.y = (el.y || 0) + 20
        })

        this.sound_mgr.playSFX('swoosh')
        this.tweens.add({
            targets: dialogElements,
            alpha: 1,
            y: '-=20',
            duration: 300,
            ease: 'Power2',
        })

        // Typewriter text
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
            .text(x, y, getHintText('BEGIN'), {
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

    // -------------------------------------------------------
    // INPUT
    // -------------------------------------------------------

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

    // -------------------------------------------------------
    // CLEANUP
    // -------------------------------------------------------

    shutdown() {
        this.tweens.killAll()
        this.time.removeAllEvents()
        if (this.typewriter) this.typewriter.destroy()
    }
}
