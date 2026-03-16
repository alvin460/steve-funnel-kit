import { useEffect, useRef, useState, useCallback } from 'react'

import { EventBus } from '../../phaser/EventBus'
import PostGameOverlay from './PostGameOverlay'

/**
 * React wrapper for the Phaser cinematic experience.
 *
 * Detects mobile portrait at mount → loads portrait game (540×960).
 * Desktop/tablet → loads landscape game (960×540).
 * After the final beat, opens the lead capture dialog directly.
 * Replay restarts from beat 1 without destroying the Phaser game instance.
 */

const DESKTOP_SCENES = [
    'DMJungleScene',
    'OrderFromChaosScene',
    'ShadowCloneScene',
    'DualWieldScene',
    'BeginTrainingScene',
]

const MOBILE_SCENES = [
    'MobileDMJungleScene',
    'MobileOrderFromChaosScene',
    'MobileShadowCloneScene',
    'MobileDualWieldScene',
    'MobileBeginTrainingScene',
]

export default function PhaserGame() {
    const gameRef = useRef<any>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const isMobileRef = useRef(false)
    const [currentBeat, setCurrentBeat] = useState(0)
    const [loading, setLoading] = useState(true)
    const [gameComplete, setGameComplete] = useState(false)
    const [muted, setMuted] = useState(true)
    const [soundPromptDismissed, setSoundPromptDismissed] = useState(false)

    const getBeatScenes = () => isMobileRef.current ? MOBILE_SCENES : DESKTOP_SCENES

    useEffect(() => {
        // Detect mobile portrait: phones in portrait orientation
        const isMobile = window.matchMedia(
            '(max-width: 768px) and (orientation: portrait)'
        ).matches
        isMobileRef.current = isMobile

        const mainModule = isMobile
            ? import('../../phaser/main-mobile')
            : import('../../phaser/main')

        mainModule.then(({ default: StartGame }) => {
            if (containerRef.current && !gameRef.current) {
                gameRef.current = StartGame(containerRef.current)
                setLoading(false)

                // Fade out the static hero loader, then remove it
                const loader = document.getElementById('game-loader')
                if (loader) {
                    loader.style.transition = 'opacity 0.4s ease-out'
                    loader.style.opacity = '0'
                    setTimeout(() => loader.remove(), 400)
                }
            }
        })

        const handleBeatComplete = () => {
            setCurrentBeat((prev) => {
                const scenes = getBeatScenes()
                const next = prev + 1
                if (next >= scenes.length) {
                    // Final beat — open lead dialog directly
                    setGameComplete(true)
                    ;(window as any).openDialog?.('early-access-dialog')
                    return prev
                }

                const scene = gameRef.current?.scene
                if (scene) {
                    const current = scene.getScene(scenes[prev])
                    if (current) {
                        current.shutdown?.()
                        scene.stop(scenes[prev])
                    }
                    scene.start(scenes[next])
                }
                return next
            })
        }

        const handleMuteChanged = (isMuted: boolean) => setMuted(isMuted)

        EventBus.on('beat-complete', handleBeatComplete)
        EventBus.on('mute-changed', handleMuteChanged)

        return () => {
            EventBus.off('beat-complete', handleBeatComplete)
            EventBus.off('mute-changed', handleMuteChanged)
            if (gameRef.current) {
                gameRef.current.destroy(true)
                gameRef.current = null
            }
        }
    }, [])

    const enableSound = useCallback(() => {
        EventBus.emit('toggle-mute')
        setSoundPromptDismissed(true)
    }, [])

    const dismissSoundPrompt = useCallback(() => {
        setSoundPromptDismissed(true)
    }, [])

    // Auto-dismiss the centered prompt after first beat advance
    useEffect(() => {
        if (currentBeat > 0) setSoundPromptDismissed(true)
    }, [currentBeat])

    // Expose replay function globally so the dialog can trigger it
    useEffect(() => {
        ;(window as any).__replayGame = () => {
            setGameComplete(false)
            setCurrentBeat(0)

            const scenes = getBeatScenes()
            const scene = gameRef.current?.scene
            if (scene) {
                const last = scene.getScene(scenes[scenes.length - 1])
                if (last) {
                    last.shutdown?.()
                    scene.stop(scenes[scenes.length - 1])
                }
                scene.start(scenes[0])
            }
        }
        return () => { delete (window as any).__replayGame }
    }, [])

    const beatScenes = getBeatScenes()

    // Progress dots — hidden when game is complete
    const dots = !gameComplete && !loading && (
        <div className="absolute bottom-[3%] left-0 right-0 z-20 flex items-center justify-center gap-1.5">
            {beatScenes.map((_, i) => (
                <span
                    key={i}
                    className="block h-2 w-2 rounded-full transition-colors duration-300"
                    style={{ backgroundColor: i <= currentBeat ? '#CEF17B' : '#3f3f5e' }}
                />
            ))}
        </div>
    )

    return (
        <div className="relative h-full w-full" style={{ backgroundColor: '#0D0D0D', touchAction: 'manipulation', overscrollBehavior: 'none' }}>
            {/* Phaser mount point — HTML #game-loader spinner shows until this is ready */}
            <div ref={containerRef} className="h-full w-full" />

            {/* Centered sound prompt — shows once at game start */}
            {!loading && muted && !soundPromptDismissed && !gameComplete && (
                <div className="absolute inset-0 z-25 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 animate-[fadeIn_0.5s_ease-out]">
                        <button
                            onClick={(e) => {
                                enableSound()
                                ;(e.currentTarget as HTMLElement).blur()
                            }}
                            className="flex items-center gap-3 rounded-full bg-white/10 px-6 py-3 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-105"
                        >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            Enable Sound
                        </button>
                        <button
                            onClick={dismissSoundPrompt}
                            className="text-xs text-white/30 transition-colors hover:text-white/50"
                        >
                            No thanks
                        </button>
                    </div>
                </div>
            )}

            {/* Post-game overlay — fallback when dialog is closed */}
            {gameComplete && (
                <PostGameOverlay
                    onOpenLeadForm={() => (window as any).openDialog?.('early-access-dialog')}
                    onReplay={() => (window as any).__replayGame?.()}
                />
            )}

            {dots}

            {/* Sound toggle pill — above dots, persistent during gameplay */}
            {!gameComplete && !loading && soundPromptDismissed && (
                <button
                    onClick={(e) => {
                        EventBus.emit('toggle-mute')
                        ;(e.currentTarget as HTMLElement).blur()
                    }}
                    className="absolute bottom-[7%] right-4 z-20 flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/70 backdrop-blur-sm transition-all hover:bg-white/20 hover:text-white"
                    aria-label={muted ? 'Enable sound' : 'Mute sound'}
                >
                    {muted ? (
                        <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                            </svg>
                            Enable Sound
                        </>
                    ) : (
                        <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M18.364 5.636a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                            </svg>
                            Sound On
                        </>
                    )}
                </button>
            )}
        </div>
    )
}
