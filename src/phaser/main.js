import Phaser from 'phaser'

import SoundManager from './audio/SoundManager'
import BeginTrainingScene from './scenes/BeginTrainingScene'
import DMJungleScene from './scenes/DMJungleScene'
import DualWieldScene from './scenes/DualWieldScene'
import OrderFromChaosScene from './scenes/OrderFromChaosScene'
import ShadowCloneScene from './scenes/ShadowCloneScene'

/**
 * Phaser game config for the onboarding experience.
 *
 * 960x540 internal resolution (16:9). pixelArt is OFF so text
 * renders with LINEAR filtering (crisp). Pixel art sprites get
 * NEAREST filtering applied manually in NinjaSprite.js.
 */
const config = {
    type: Phaser.AUTO,
    width: 960,
    height: 540,
    backgroundColor: '#0D0D0D',
    pixelArt: false,
    antialias: true,
    roundPixels: false,
    audio: {
        disableWebAudio: false,
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    scene: [
        DMJungleScene,
        OrderFromChaosScene,
        ShadowCloneScene,
        DualWieldScene,
        BeginTrainingScene,
    ],
}

export default function StartGame(parent) {
    const game = new Phaser.Game({ ...config, parent })
    SoundManager.getInstance().preloadSFX()
    return game
}
