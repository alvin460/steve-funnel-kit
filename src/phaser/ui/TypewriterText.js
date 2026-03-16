import SoundManager from '../audio/SoundManager'

/**
 * Character-by-character typewriter text for Phaser scenes.
 *
 * Creates a text object that reveals one character at a time.
 * Returns a handle with skip() to jump to full text.
 *
 * @param {Phaser.Scene} scene
 * @param {number} x
 * @param {number} y
 * @param {string} fullText
 * @param {object} config
 * @returns {{ textObj: Phaser.GameObjects.Text, skip: () => void, isComplete: boolean }}
 */
export function createTypewriter(scene, x, y, fullText, config = {}) {
    const {
        fontFamily = '"Press Start 2P"',
        fontSize = '9px',
        color = '#E8E8E8',
        speed = 25,
        wordWrapWidth = 500,
        lineSpacing = 12,
        onComplete = () => {},
    } = config

    const textObj = scene.add.text(x, y, '', {
        fontFamily,
        fontSize,
        color,
        lineSpacing,
        wordWrap: { width: wordWrapWidth },
        resolution: 4,
    }).setDepth(10)

    let charIndex = 0
    let done = false

    const timer = scene.time.addEvent({
        delay: speed,
        repeat: fullText.length - 1,
        callback: () => {
            if (done) return
            charIndex++
            textObj.setText(fullText.substring(0, charIndex))

            // Tick sound on visible characters (skip spaces/newlines)
            const ch = fullText[charIndex - 1]
            if (ch && ch !== ' ' && ch !== '\n') {
                SoundManager.getInstance().playSFX('tick', { volume: 0.3 })
            }

            if (charIndex >= fullText.length) {
                done = true
                cursor.setVisible(false)
                onComplete()
            }
        },
    })

    // Blinking cursor
    const cursor = scene.add.rectangle(x + 4, y + 4, 6, 9, 0xcef17b).setDepth(10)
    scene.tweens.add({
        targets: cursor,
        alpha: { from: 1, to: 0 },
        duration: 500,
        yoyo: true,
        repeat: -1,
    })

    // Track cursor position each frame
    const updateHandler = () => {
        if (!textObj.active) return
        const bounds = textObj.getBounds()
        cursor.setPosition(bounds.right + 4, bounds.bottom - 5)
    }
    scene.events.on('update', updateHandler)

    const handle = {
        textObj,
        cursor,
        get isComplete() {
            return done
        },
        skip() {
            if (done) return
            done = true
            timer.remove()
            textObj.setText(fullText)
            cursor.setVisible(false)
            onComplete()
        },
        destroy() {
            scene.events.off('update', updateHandler)
            timer.remove()
            textObj.destroy()
            cursor.destroy()
        },
    }

    return handle
}
