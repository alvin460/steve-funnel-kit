import Phaser from 'phaser'

/**
 * Shared event emitter for React ↔ Phaser communication.
 *
 * Events:
 *   'current-scene-ready' (scene) — fired by each scene in create()
 *   'beat-complete'               — fired when user clicks to advance
 */
export const EventBus = new Phaser.Events.EventEmitter()
