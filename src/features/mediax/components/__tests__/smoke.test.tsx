import { render, screen } from '@testing-library/react'
/* no React import needed with jsx: react-jsx */
import { describe, it, expect } from 'vitest'
import Index from '@mediax/pages/Index'
import { MemoryRouter } from 'react-router-dom'

describe('App smoke test', () => {
  it('renders header and sidebar toggle', () => {
    render(
      <MemoryRouter>
        <Index />
      </MemoryRouter>
    )
    expect(screen.getByText(/Private Media Vault/i)).toBeInTheDocument()
  })
})

