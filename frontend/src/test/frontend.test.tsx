import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../pages/HomePage.js';
import { DrinkBuilderPage } from '../pages/DrinkBuilderPage.js';
import { AiLabPage } from '../pages/AiLabPage.js';
import { TableProvider } from '../context/TableContext.js';
import { CartProvider } from '../context/CartContext.js';
import { ThemeProvider } from '../context/ThemeContext.js';
import { ToastProvider } from '../context/ToastContext.js';

describe('BrewBuddy Café Frontend Suite', () => {
  beforeEach(() => {
    localStorage.clear();
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
