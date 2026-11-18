import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage.js';
import { DrinkBuilderPage } from '../pages/DrinkBuilderPage.js';
import { AiLabPage } from '../pages/AiLabPage.js';
import { TableProvider } from '../context/TableContext.js';
import { CartProvider } from '../context/CartContext.js';
import { ThemeProvider, useTheme } from '../context/ThemeContext.js';
import { ToastProvider } from '../context/ToastContext.js';

const ContrastTestComponent = () => {
  const { contrastMode, highContrast, isSystemHighContrast, setContrastMode } = useTheme();
  return (
    <div>
      <span data-testid="contrast-mode">{contrastMode}</span>
      <span data-testid="is-high-contrast">{highContrast ? 'yes' : 'no'}</span>
      <span data-testid="is-system-high-contrast">{isSystemHighContrast ? 'yes' : 'no'}</span>
      <button onClick={() => setContrastMode('high')}>Set High</button>
      <button onClick={() => setContrastMode('normal')}>Set Normal</button>
      <button onClick={() => setContrastMode('auto')}>Set Auto</button>
    </div>
  );
};

describe('BrewBuddy Café Frontend Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  it('defaults contrastMode to automatic and reacts to user overrides', () => {
    render(
      <ThemeProvider>
        <ContrastTestComponent />
      </ThemeProvider>
    );

    // Initial default should be 'auto'
    expect(screen.getByTestId('contrast-mode').textContent).toBe('auto');

    // Switch to high
    fireEvent.click(screen.getByText('Set High'));
    expect(screen.getByTestId('contrast-mode').textContent).toBe('high');
    expect(screen.getByTestId('is-high-contrast').textContent).toBe('yes');
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);

    // Switch to normal
    fireEvent.click(screen.getByText('Set Normal'));
    expect(screen.getByTestId('contrast-mode').textContent).toBe('normal');
    expect(screen.getByTestId('is-high-contrast').textContent).toBe('no');
    expect(document.documentElement.classList.contains('standard-contrast')).toBe(true);
    expect(document.documentElement.classList.contains('high-contrast')).toBe(false);

    // Switch back to auto
    fireEvent.click(screen.getByText('Set Auto'));
    expect(screen.getByTestId('contrast-mode').textContent).toBe('auto');
  });

  it('renders HomePage headline and call to actions', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <TableProvider>
            <CartProvider>
              <MemoryRouter>
                <HomePage />
              </MemoryRouter>
            </CartProvider>
          </TableProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    expect(screen.getAllByText(/Your Table/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Your Order/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Explore Menu/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Ask AI Barista/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Scan a Table/i)).toBeInTheDocument();
  });

  it('renders DrinkBuilderPage and calculates customized drink price live', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <TableProvider>
            <CartProvider>
              <MemoryRouter>
                <DrinkBuilderPage />
              </MemoryRouter>
            </CartProvider>
          </TableProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/Build Your Drink/i)).toBeInTheDocument();
    expect(screen.getByText(/Choose Drink Base/i)).toBeInTheDocument();

    // Default base is Velvet Cappuccino (190) + Oat Milk (40) + Large (40) + Vanilla extra (30) = 300
    // Verify the total calculation displays in the summary card
    const totals = screen.getAllByText(/₹300/i);
    expect(totals.length).toBeGreaterThan(0);
  });

  it('renders AiLabPage with 7-Stage pipeline and simulation playground', () => {
    render(
      <ThemeProvider>
        <ToastProvider>
          <TableProvider>
            <CartProvider>
              <MemoryRouter>
                <AiLabPage />
              </MemoryRouter>
            </CartProvider>
          </TableProvider>
        </ToastProvider>
      </ThemeProvider>
    );

    expect(screen.getByText(/AI Architecture & Integrity Lab/i)).toBeInTheDocument();
    expect(screen.getByText(/7-Stage Grounded Verification Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/Interactive Hallucination Rejection Playground/i)).toBeInTheDocument();

    // Run simulation
    const simulateBtn = screen.getByText(/Simulate Validation Sieve/i);
    fireEvent.click(simulateBtn);

    expect(screen.getByText(/SIEVING LOGS:/i)).toBeInTheDocument();
    expect(screen.getByText(/REJECTED BY BACKEND/i)).toBeInTheDocument();
  });
});
