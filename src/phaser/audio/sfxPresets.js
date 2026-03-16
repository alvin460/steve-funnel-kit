/**
 * jsfxr sound effect parameter presets for the onboarding cinematic.
 *
 * Each preset is a plain object with jsfxr parameter keys.
 * Wave types: 0=Square, 1=Sawtooth, 2=Sine, 3=Noise
 * Most params range 0–1; signed params can be negative.
 *
 * These are deterministic (no randomness) so sounds are consistent
 * across sessions. Tune values at https://sfxr.me/ and paste here.
 */

// Shared defaults — only override what differs
const DEFAULTS = {
  oldParams: true,
  wave_type: 0,
  p_env_attack: 0,
  p_env_sustain: 0.3,
  p_env_punch: 0,
  p_env_decay: 0.4,
  p_base_freq: 0.3,
  p_freq_limit: 0,
  p_freq_ramp: 0,
  p_freq_dramp: 0,
  p_vib_strength: 0,
  p_vib_speed: 0,
  p_arp_mod: 0,
  p_arp_speed: 0,
  p_duty: 0,
  p_duty_ramp: 0,
  p_repeat_speed: 0,
  p_pha_offset: 0,
  p_pha_ramp: 0,
  p_lpf_freq: 1,
  p_lpf_ramp: 0,
  p_lpf_resonance: 0,
  p_hpf_freq: 0,
  p_hpf_ramp: 0,
  sound_vol: 0.5,
  sample_rate: 44100,
  sample_size: 8,
}

function preset(overrides) {
  return { ...DEFAULTS, ...overrides }
}

const SFX_PRESETS = {
  // --- Universal (all beats) ---

  // Typewriter character tick — very soft, fast square click
  tick: preset({
    wave_type: 0,
    p_base_freq: 0.85,
    p_env_sustain: 0.02,
    p_env_decay: 0.05,
    p_hpf_freq: 0.6,
    sound_vol: 0.3,
  }),

  // Beat advance — short chime confirming progression
  advance: preset({
    wave_type: 1,
    p_base_freq: 0.5,
    p_env_sustain: 0.08,
    p_env_decay: 0.3,
    p_env_punch: 0.4,
    p_arp_mod: 0.3,
    p_arp_speed: 0.5,
    sound_vol: 0.5,
  }),

  // Scene transition whoosh
  swoosh: preset({
    wave_type: 3,
    p_base_freq: 0.15,
    p_env_sustain: 0.12,
    p_env_decay: 0.25,
    p_freq_ramp: -0.3,
    p_hpf_freq: 0.2,
    sound_vol: 0.4,
  }),

  // --- Beat 1: DM Jungle ---

  // Ninja lands on rooftop — thud with low punch
  ninjaLand: preset({
    wave_type: 3,
    p_base_freq: 0.12,
    p_env_sustain: 0.08,
    p_env_decay: 0.3,
    p_env_punch: 0.6,
    p_freq_ramp: -0.15,
    p_lpf_freq: 0.4,
    sound_vol: 0.5,
  }),

  // DM message pops into pile — bubbly pop (use detune for variety)
  messagePop: preset({
    wave_type: 2,
    p_base_freq: 0.55,
    p_env_sustain: 0.04,
    p_env_decay: 0.12,
    p_env_punch: 0.3,
    p_freq_ramp: 0.15,
    sound_vol: 0.4,
  }),

  // Counter incrementing — soft digital tick
  counterTick: preset({
    wave_type: 0,
    p_base_freq: 0.7,
    p_env_sustain: 0.02,
    p_env_decay: 0.04,
    p_duty: 0.3,
    p_hpf_freq: 0.5,
    sound_vol: 0.3,
  }),

  // Shuriken thrown — sharp metallic swipe
  shurikenThrow: preset({
    wave_type: 1,
    p_base_freq: 0.6,
    p_env_sustain: 0.06,
    p_env_decay: 0.15,
    p_freq_ramp: -0.4,
    p_duty: 0.8,
    p_hpf_freq: 0.25,
    sound_vol: 0.5,
  }),

  // Shuriken slices through DMs — quick metallic slash
  shurikenSlice: preset({
    wave_type: 3,
    p_base_freq: 0.4,
    p_env_sustain: 0.04,
    p_env_decay: 0.1,
    p_env_punch: 0.5,
    p_freq_ramp: -0.5,
    p_hpf_freq: 0.35,
    sound_vol: 0.45,
  }),

  // LINKNINJA title card — dramatic 8-bit power chord
  titleReveal: preset({
    wave_type: 0,
    p_base_freq: 0.35,
    p_env_sustain: 0.15,
    p_env_decay: 0.45,
    p_env_punch: 0.5,
    p_arp_mod: 0.4,
    p_arp_speed: 0.45,
    p_duty: 0.5,
    p_freq_ramp: 0.05,
    sound_vol: 0.5,
  }),

  // --- Beat 2: Order from Chaos ---

  // Message card slides onto conveyor
  conveyorSlide: preset({
    wave_type: 3,
    p_base_freq: 0.25,
    p_env_sustain: 0.06,
    p_env_decay: 0.12,
    p_freq_ramp: 0.2,
    p_hpf_freq: 0.3,
    sound_vol: 0.35,
  }),

  // Stage badge stamps on card — mechanical thunk
  stampBadge: preset({
    wave_type: 3,
    p_base_freq: 0.2,
    p_env_sustain: 0.05,
    p_env_decay: 0.15,
    p_env_punch: 0.7,
    p_lpf_freq: 0.5,
    sound_vol: 0.5,
  }),

  // Card flies to sorted position — short whoosh
  cardSort: preset({
    wave_type: 3,
    p_base_freq: 0.35,
    p_env_sustain: 0.04,
    p_env_decay: 0.1,
    p_freq_ramp: -0.25,
    p_hpf_freq: 0.2,
    sound_vol: 0.35,
  }),

  // --- Beat 3: Shadow Clone ---

  // Shadow clone jutsu — explosion/poof
  cloneJutsu: preset({
    wave_type: 3,
    p_base_freq: 0.18,
    p_env_sustain: 0.15,
    p_env_decay: 0.35,
    p_env_punch: 0.6,
    p_freq_ramp: -0.1,
    p_lpf_freq: 0.6,
    sound_vol: 0.5,
  }),

  // Ghost clone fades in — ethereal shimmer
  cloneAppear: preset({
    wave_type: 2,
    p_base_freq: 0.4,
    p_env_sustain: 0.2,
    p_env_decay: 0.4,
    p_freq_ramp: 0.08,
    p_vib_strength: 0.3,
    p_vib_speed: 0.4,
    sound_vol: 0.4,
  }),

  // Context card absorbed — power-up collect
  contextAbsorb: preset({
    wave_type: 1,
    p_base_freq: 0.45,
    p_env_sustain: 0.06,
    p_env_decay: 0.2,
    p_env_punch: 0.3,
    p_arp_mod: 0.25,
    p_arp_speed: 0.55,
    p_duty: 1,
    sound_vol: 0.4,
  }),

  // --- Beat 4: Dual Wield ---

  // Dashboard/AI panel slides in — mechanical slide
  panelSlide: preset({
    wave_type: 3,
    p_base_freq: 0.3,
    p_env_sustain: 0.1,
    p_env_decay: 0.2,
    p_freq_ramp: -0.15,
    p_lpf_freq: 0.7,
    sound_vol: 0.4,
  }),

  // Arrow bouncing between panels — soft ping
  arrowBounce: preset({
    wave_type: 2,
    p_base_freq: 0.6,
    p_env_sustain: 0.03,
    p_env_decay: 0.1,
    p_freq_ramp: 0.1,
    sound_vol: 0.35,
  }),

  // SYNCED achievement — satisfying ding
  syncPulse: preset({
    wave_type: 0,
    p_base_freq: 0.45,
    p_env_sustain: 0.1,
    p_env_decay: 0.35,
    p_env_punch: 0.4,
    p_arp_mod: 0.35,
    p_arp_speed: 0.5,
    p_duty: 0.4,
    sound_vol: 0.5,
  }),

  // --- Beat 5: Begin Training ---

  // Checklist item appears — pop/reveal
  checklistItem: preset({
    wave_type: 0,
    p_base_freq: 0.5,
    p_env_sustain: 0.05,
    p_env_decay: 0.15,
    p_env_punch: 0.35,
    p_arp_mod: 0.2,
    p_arp_speed: 0.6,
    p_duty: 0.3,
    sound_vol: 0.4,
  }),
}

export default SFX_PRESETS
