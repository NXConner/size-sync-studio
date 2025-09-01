import { render, screen, fireEvent } from '@testing-library/react'
/* no React import needed with jsx: react-jsx */
import { describe, it, expect, vi } from 'vitest'
import { MediaGallery } from '@mediax/components/MediaGallery'
import type { MediaItem } from '@mediax/pages/Index'

const sampleItems: MediaItem[] = [
  {
    id: '1',
    type: 'image',
    url: 'https://example.com/1.jpg',
    thumbnail: 'https://example.com/1-thumb.jpg',
    title: 'Item One',
    collection: 'recent',
    tags: [],
    uploadDate: new Date(),
    size: 1000,
  },
]

describe('MediaGallery', () => {
  it('shows empty state when no items', () => {
    render(<MediaGallery mediaItems={[]} onMediaSelect={() => {}} />)
    expect(screen.getByText(/No media found/i)).toBeInTheDocument()
  })

  it('renders items and fires onMediaSelect when clicked', () => {
    const onSelect = vi.fn()
    render(<MediaGallery mediaItems={sampleItems} onMediaSelect={onSelect} />)
    const thumb = screen.getByAltText('Item One')
    fireEvent.click(thumb)
    expect(onSelect).toHaveBeenCalledWith(sampleItems[0])
  })
})

