import { render, screen, fireEvent } from '@testing-library/react'
/* no React import needed with jsx: react-jsx */
import { describe, it, expect, vi } from 'vitest'
import { Sidebar } from '@mediax/components/Sidebar'
import { MemoryRouter } from 'react-router-dom'

describe('Sidebar (app-specific)', () => {
  it('renders collections and triggers actions', () => {
    const onChange = vi.fn()
    const onUpload = vi.fn()
    render(
      <MemoryRouter>
        <Sidebar
          isOpen
          collections={['all', 'recent', 'favorites']}
          selectedCollection="all"
          onCollectionChange={onChange}
          onUpload={onUpload}
        />
      </MemoryRouter>
    )

    // Upload button
    fireEvent.click(screen.getByText(/Upload Media/i))
    expect(onUpload).toHaveBeenCalled()

    // Click collection
    fireEvent.click(screen.getByText('Recent'))
    expect(onChange).toHaveBeenCalledWith('recent')
  })
})

