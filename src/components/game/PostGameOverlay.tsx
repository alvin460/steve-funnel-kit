import { useEffect, useState } from 'react'
import { buttonVariants } from '@/components/ui/form/Button/button.variants'
import { cn } from '@/lib/cn'

interface PostGameOverlayProps {
  onOpenLeadForm: () => void
  onReplay: () => void
}

export default function PostGameOverlay({ onOpenLeadForm, onReplay }: PostGameOverlayProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Trigger fade-in on next frame
    requestAnimationFrame(() => setVisible(true))
  }, [])

  return (
    <div
      className={cn(
        'absolute inset-0 z-30 flex flex-col items-center justify-center',
        'bg-black/80 backdrop-blur-sm',
        'transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="max-w-md px-6 text-center">
        <h2
          className="mb-3 text-2xl font-bold tracking-tight text-white md:text-3xl"
          style={{ fontFamily: '"Press Start 2P", monospace', fontSize: '1rem', lineHeight: '1.8' }}
        >
          That's the whole playbook.
        </h2>
        <p className="mb-8 text-base text-white/70 md:text-lg">
          Four steps. One AI ninja. Your LinkedIn, handled.
        </p>

        <button
          onClick={onOpenLeadForm}
          className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full max-w-xs')}
        >
          Get Early Access
        </button>

        <button
          onClick={onReplay}
          className="mt-6 block w-full text-center text-sm text-white/40 transition-colors hover:text-white/70"
        >
          Watch again
        </button>
      </div>
    </div>
  )
}
