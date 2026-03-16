import { sfxr } from 'jsfxr'

import { EventBus } from '../EventBus'
import SFX_PRESETS from './sfxPresets'

/**
 * Central audio manager for the onboarding cinematic.
 *
 * Game audio architecture:
 *   - SFX via jsfxr (Web Audio API) — always at full clarity
 *   - Music via HTML Audio element — ducks when SFX play
 *   - Ducking: music volume drops briefly so SFX punch through,
 *     then recovers smoothly. Multiple rapid SFX extend the duck
 *     window without stacking volume drops.
 *
 * Muted by default (browser autoplay policy). React ↔ Phaser
 * sync via EventBus.
 */

// --- Ducking tuning constants ---
const MUSIC_BASE_VOL = 0.25       // Resting music volume
const MUSIC_DUCK_VOL = 0.14       // Volume during SFX playback (subtle dip, not dropout)
const DUCK_ATTACK_MS = 150        // Gentle duck-down (not abrupt)
const DUCK_RELEASE_MS = 800       // Slow smooth recovery
const DUCK_HOLD_MS = 200          // Brief hold at ducked level
const MUSIC_FADE_IN_MS = 2000     // Initial music fade-in duration

class SoundManager {
  static instance = null

  static getInstance() {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager()
    }
    return SoundManager.instance
  }

  constructor() {
    this.muted = true
    this.sfxVolume = 0.8
    this.cache = {}         // key → jsfxr audio object (with play/setVolume)
    this.preloaded = false
    this.music = null       // HTMLAudioElement for bg music
    this.musicSrc = null
    this._duckTimer = null  // setTimeout ID for duck release
    this._fadeInterval = null

    // Listen for toggle events from React
    EventBus.on('toggle-mute', () => this.toggleMute())
  }

  // ---------- SFX ----------

  /**
   * Pre-generate all SFX audio objects from jsfxr presets.
   * Uses Web Audio API for low-latency concurrent playback.
   */
  preloadSFX() {
    if (this.preloaded) return

    let count = 0
    for (const [key, params] of Object.entries(SFX_PRESETS)) {
      try {
        const audio = sfxr.toAudio(params)
        this.cache[key] = audio
        count++
      } catch (e) {
        console.warn(`[SoundManager] Failed to generate SFX: ${key}`, e)
      }
    }

    this.preloaded = true
    console.log(`[SoundManager] Preloaded ${count}/${Object.keys(SFX_PRESETS).length} SFX`)
  }

  /**
   * Play a sound effect. Ducks music automatically.
   *
   * @param {string} key - SFX preset key
   * @param {object} config - Optional { volume: 0-1 }
   */
  playSFX(key, config = {}) {
    if (this.muted) return

    const audio = this.cache[key]
    if (!audio) return

    try {
      const vol = this.sfxVolume * (config.volume || 1)
      audio.setVolume(vol)
      audio.play()
      this._duckMusic()
    } catch {
      // Audio playback failed — silent fail
    }
  }

  // ---------- Music ----------

  /**
   * Register the music source and start if unmuted.
   * Call from the first scene's create().
   */
  startMusic(src) {
    this.musicSrc = src
    if (this.muted || !src) return
    this._playMusic()
  }

  _playMusic() {
    if (!this.musicSrc) return

    // Reuse existing element if same source
    if (this.music && this.music.src.includes(this.musicSrc)) {
      if (this.music.paused) {
        this.music.play().catch(() => {})
      }
      return
    }

    // Create new music element — start silent, fade in
    this.music = new Audio(this.musicSrc)
    this.music.loop = true
    this.music.volume = 0
    this.music.play().catch(() => {})
    this._fadeIn(MUSIC_BASE_VOL, MUSIC_FADE_IN_MS)
  }

  stopMusic() {
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval)
      this._fadeInterval = null
    }
    if (this.music) {
      this.music.pause()
      this.music.currentTime = 0
    }
  }

  // ---------- Ducking ----------

  /**
   * Duck music volume when an SFX fires.
   * Rapid SFX extend the hold window without stacking drops.
   */
  _duckMusic() {
    if (!this.music || this.music.paused) return

    // Cancel any pending release or fade
    if (this._duckTimer) {
      clearTimeout(this._duckTimer)
      this._duckTimer = null
    }
    if (this._fadeInterval) {
      clearInterval(this._fadeInterval)
      this._fadeInterval = null
    }

    // Quick drop to duck volume
    this._fadeTo(MUSIC_DUCK_VOL, DUCK_ATTACK_MS)

    // After hold period, smoothly recover to base volume
    this._duckTimer = setTimeout(() => {
      this._duckTimer = null
      this._fadeTo(MUSIC_BASE_VOL, DUCK_RELEASE_MS)
    }, DUCK_HOLD_MS)
  }

  /**
   * Smoothly transition music volume from current to target.
   */
  _fadeTo(targetVol, durationMs) {
    if (!this.music) return

    if (this._fadeInterval) {
      clearInterval(this._fadeInterval)
    }

    const startVol = this.music.volume
    const delta = targetVol - startVol
    if (Math.abs(delta) < 0.005) {
      this.music.volume = targetVol
      return
    }

    const steps = Math.max(1, Math.floor(durationMs / 16)) // ~60fps
    const stepSize = delta / steps
    let step = 0

    this._fadeInterval = setInterval(() => {
      step++
      if (step >= steps) {
        this.music.volume = targetVol
        clearInterval(this._fadeInterval)
        this._fadeInterval = null
      } else {
        this.music.volume = Math.max(0, Math.min(1, startVol + stepSize * step))
      }
    }, 16)
  }

  /**
   * Fade in from 0 to target over duration.
   */
  _fadeIn(targetVol, durationMs) {
    this._fadeTo(targetVol, durationMs)
  }

  // ---------- Mute control ----------

  setMuted(muted) {
    this.muted = muted

    try {
      localStorage.setItem('onboarding-muted', String(muted))
    } catch {
      // localStorage unavailable
    }

    if (muted) {
      this.stopMusic()
    } else {
      if (!this.preloaded) {
        this.preloadSFX()
      }
      this._playMusic()
    }

    EventBus.emit('mute-changed', muted)
  }

  toggleMute() {
    this.setMuted(!this.muted)
  }

  // ---------- Cleanup ----------

  destroy() {
    this.stopMusic()
    if (this._duckTimer) clearTimeout(this._duckTimer)
    this.music = null
    this.cache = {}
    this.preloaded = false
    EventBus.off('toggle-mute')
    SoundManager.instance = null
  }
}

export default SoundManager
