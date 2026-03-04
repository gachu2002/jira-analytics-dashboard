import { useEffect, useMemo, useState } from 'react'

export const useCountUp = (target: number, duration = 400) => {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let rafId = 0
    const startTime = performance.now()

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)
      setValue(Math.round(target * progress))

      if (progress < 1) {
        rafId = window.requestAnimationFrame(animate)
      }
    }

    rafId = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(rafId)
  }, [duration, target])

  return useMemo(() => value, [value])
}
