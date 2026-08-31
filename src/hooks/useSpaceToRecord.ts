import { useEffect, useRef } from 'react'

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return EDITABLE_TAGS.has(target.tagName) || target.isContentEditable
}

/**
 * Desktop equivalent of the mobile hold-the-mic-button gesture: hold
 * Space to record, release to stop and process. Only while this
 * component is mounted (Miamala) and the tab is focused — a website
 * cannot register a system-wide hotkey the way a native app (e.g. Wispr
 * Flow) can, so this is scoped to the tab, not the OS. Ignores Space
 * while typing in a form field, and ignores key-repeat so holding
 * doesn't restart the recording. Escape while held discards instead of
 * processing — the safety valve a touch hold-and-release doesn't have.
 */
export function useSpaceToRecord(
  start: () => void,
  stop: () => void,
  cancel: () => void,
  active: boolean,
) {
  const isHoldingRef = useRef(false)

  useEffect(() => {
    if (!active) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'Escape' && isHoldingRef.current) {
        isHoldingRef.current = false
        cancel()
        return
      }
      if (event.code !== 'Space' || event.repeat || isTypingTarget(event.target)) return
      event.preventDefault()
      isHoldingRef.current = true
      start()
    }

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !isHoldingRef.current) return
      isHoldingRef.current = false
      stop()
    }

    // Releasing outside the window (e.g. Alt-tabbing away mid-hold) must
    // still stop the recording — never leave the mic capturing silently.
    const handleBlur = () => {
      if (!isHoldingRef.current) return
      isHoldingRef.current = false
      stop()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [start, stop, cancel, active])
}
