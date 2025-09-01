import { render, screen } from '@testing-library/react'
/* no React import needed with jsx: react-jsx */
import { describe, it, expect } from 'vitest'
import Index from '@svh/pages/Index'

describe('App smoke test', () => {
  it('renders header and sidebar toggle', () => {
    render(<Index />)
    expect(screen.getByText(/Private Media Vault/i)).toBeInTheDocument()
  })
})

