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
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Sessions/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Measure/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Gallery/i })).toBeInTheDocument();
  });
});