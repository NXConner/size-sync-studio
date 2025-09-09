import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe('Navbar', () => {
  it('renders brand and key nav links', () => {
    renderWithRouter(<Navbar />);
    expect(screen.getByText(/Size Seeker/i)).toBeInTheDocument();
    // Multiple dashboard links exist (desktop + compact). Ensure at least one is present.
    expect(screen.getAllByRole('link', { name: /Dashboard/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Sessions/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Measure/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByRole('link', { name: /Gallery/i }).length).toBeGreaterThan(0);
  });
});