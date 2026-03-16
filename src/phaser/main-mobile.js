import Phaser from 'phaser'

import SoundManager from './audio/SoundManager'
import MobileBeginTrainingScene from './scenes/mobile/MobileBeginTrainingScene'
import MobileDMJungleScene from './scenes/mobile/MobileDMJungleScene'
import MobileDualWieldScene from './scenes/mobile/MobileDualWieldScene'
import MobileOrderFromChaosScene from './scenes/mobile/MobileOrderFromChaosScene'
import MobileShadowCloneScene from './scenes/mobile/MobileShadowCloneScene'

/**
 * Phaser game config for the mobile portrait experience.
 *
 * 540x960 internal resolution (9:16). Same render settings as
 * desktop main.js — pixelArt OFF for crisp text, LINEAR filtering.
 */
const config = {
    type: Phaser.AUTO,
    width: 540,
    height: 960,
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
        MobileDMJungleScene,
        MobileOrderFromChaosScene,
        MobileShadowCloneScene,
        MobileDualWieldScene,
        MobileBeginTrainingScene,
    ],
}

export default function StartGame(parent) {
    const game = new Phaser.Game({ ...config, parent })
    SoundManager.getInstance().preloadSFX()
    return game
}
