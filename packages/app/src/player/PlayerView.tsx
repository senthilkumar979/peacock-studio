import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AppHeader } from '@/components/AppHeader'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useFlowStore } from '@/store/flowStore'
import { PlayerControls } from './PlayerControls'
import { PlayerStep } from './PlayerStep'

const AUTO_PLAY_MS = 2500

interface PlayerViewProps {
  documentId: string;
}

export const PlayerView = ({ documentId }: PlayerViewProps) => {
  const flow = useFlowStore((state) => state.flow)
  const steps = useFlowStore((state) => state.steps)
  const screenshotUrls = useFlowStore((state) => state.screenshotUrls)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)

  const currentStep = steps[currentIndex] ?? null

  const keyboardHandlers = useMemo(
    () => ({
      ArrowRight: () =>
        setCurrentIndex((index) => Math.min(index + 1, steps.length - 1)),
      ArrowLeft: () => setCurrentIndex((index) => Math.max(index - 1, 0)),
      Space: () => setIsPlaying((playing) => !playing),
    }),
    [steps.length],
  )

  useKeyboard(keyboardHandlers)

  useEffect(() => {
    if (!isPlaying) return

    const timer = window.setTimeout(() => {
      if (currentIndex < steps.length - 1) {
        setCurrentIndex((index) => index + 1)
        return
      }
      setIsPlaying(false)
    }, AUTO_PLAY_MS)

    return () => window.clearTimeout(timer)
  }, [isPlaying, currentIndex, steps.length])

  useEffect(() => {
    if (currentIndex > steps.length - 1) {
      setCurrentIndex(Math.max(steps.length - 1, 0))
    }
  }, [currentIndex, steps.length])

  if (!currentStep) {
    return null
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-slate-50">
      <AppHeader
        eyebrow="Peacock Studio Player"
        title={flow?.flow.title ?? 'Untitled Flow'}
        homeLink
        documentId={documentId}
      >
        <Link
          to={`/docs/${documentId}/edit`}
          className="rounded-lg border border-peacock-200 bg-peacock-50 px-3 py-2 text-sm font-medium text-peacock-800 hover:bg-peacock-100"
        >
          Edit flow
        </Link>
      </AppHeader>

      <main className="flex min-h-0 flex-1 items-center justify-center overflow-hidden px-3 py-4 md:px-6">
        <PlayerStep
          step={currentStep}
          stepNumber={currentIndex + 1}
          screenshotUrls={screenshotUrls}
        />
      </main>

      <PlayerControls
        currentIndex={currentIndex}
        totalSteps={steps.length}
        isPlaying={isPlaying}
        onPrevious={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
        onNext={() =>
          setCurrentIndex((index) => Math.min(index + 1, steps.length - 1))
        }
        onTogglePlay={() => setIsPlaying((playing) => !playing)}
      />
    </div>
  )
}
