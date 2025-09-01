import { render, screen, fireEvent } from '@testing-library/react'
/* no React import needed with jsx: react-jsx */
import { describe, it, expect, vi } from 'vitest'
import { MediaViewer } from '@svh/components/MediaViewer'
import type { MediaItem } from '@svh/pages/Index'

const media: MediaItem = {
  id: 'm1',
  type: 'image',
  url: 'https://example.com/pic.jpg',
  thumbnail: 'https://example.com/pic-thumb.jpg',
  title: 'Pic',
  collection: 'recent',
  tags: ['tag'],
  uploadDate: new Date(),
  size: 1024,
}

describe('MediaViewer', () => {
  it('renders media and calls handlers', () => {
    const onClose = vi.fn()
    const onNext = vi.fn()
    const onPrev = vi.fn()
    const onSet = vi.fn()
    render(
      <MediaViewer
        media={media}
        onClose={onClose}
        onNext={onNext}
        onPrevious={onPrev}
        onSetWallpaper={onSet}
        onUpdateMeta={async () => {}}
      />
    )

    // Close via Escape key to avoid brittle button query order
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()

    // Set wallpaper button is present and clickable
    const closeButtons = screen.getAllByRole('button')
    const setBtn = closeButtons.find((el) => el.getAttribute('title') === 'Set as Wallpaper')
    expect(setBtn).toBeTruthy()
    if (setBtn) fireEvent.click(setBtn)
    expect(onSet).toHaveBeenCalled()

    // Navigation via keyboard
    fireEvent.keyDown(document, { key: 'ArrowLeft' })
    fireEvent.keyDown(document, { key: 'ArrowRight' })
    expect(onPrev).toHaveBeenCalled()
    expect(onNext).toHaveBeenCalled()
  })
})

