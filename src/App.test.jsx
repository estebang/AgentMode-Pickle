import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import App from './App';

describe('Pickleball Court Reservation App', () => {
  test('renders main title', () => {
    render(<App />);
    expect(screen.getByText(/Pickleball Court Reservations/i)).toBeInTheDocument();
  });

  test('shows daily and weekly view toggle', () => {
    render(<App />);
    expect(screen.getByRole('button', { name: /Daily/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Weekly/i })).toBeInTheDocument();
  });

  test('renders daily view table', () => {
    render(<App />);
    expect(screen.getByText(/Daily View:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Court 1/i).length).toBeGreaterThan(0);
  });

  test('can open and close add reservation form', () => {
    render(<App />);
    const addBtn = screen.getByRole('button', { name: /Add Reservation/i });
    fireEvent.click(addBtn);
    expect(screen.getByText(/Player Name/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    expect(screen.queryByText(/Player Name/i)).not.toBeInTheDocument();
  });

  test('shows weekly view table', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Weekly/i }));
    expect(screen.getByText(/Weekly View/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Court 1/i).length).toBeGreaterThan(0);
  });
});
