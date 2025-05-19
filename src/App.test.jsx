import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
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

  test('can filter to show only available times in daily view', () => {
    render(<App />);
    // Check the filter checkbox
    const filterCheckbox = screen.getByLabelText(/Show Only Available Times/i);
    fireEvent.click(filterCheckbox);
    // After filtering, all visible cells should be green (Available)
    const availableCells = screen.getAllByText(/Available/i);
    expect(availableCells.length).toBeGreaterThan(0);
  });

  // Helper to navigate to a day with an available slot
  function goToDayWithAvailableSlot() {
    let tries = 0;
    while (tries < 10) {
      const availableCells = screen.queryAllByText(/Available/i);
      if (availableCells.length > 0) return availableCells;
      fireEvent.click(screen.getByRole('button', { name: /Next/i }));
      tries++;
    }
    throw new Error('No available slots found in 10 days');
  }

  test('can make a reservation directly from an available slot in daily view', async () => {
    render(<App />);
    let availableCells = goToDayWithAvailableSlot();
    const availableSpan = availableCells[0];
    const availableTd = availableSpan.parentElement;
    window.prompt = vi.fn(() => 'Test Player');
    fireEvent.click(availableTd);
    // Wait for the cell to update with the new reservation name, scoped to the cell
    await within(availableTd).findByText('Test Player');
    expect(availableTd).toHaveTextContent('Test Player');
    expect(availableTd).not.toHaveTextContent(/Available/i);
  });

  test('can remove a reservation by clicking the red icon in daily view', async () => {
    render(<App />);
    let availableCells = goToDayWithAvailableSlot();
    const availableTd = availableCells[0].parentElement;
    window.prompt = vi.fn();
    fireEvent.click(screen.getByRole('button', { name: /Add Reservation/i }));
    fireEvent.change(screen.getByLabelText(/Player Name/i), { target: { value: 'RemoveMe' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    // Wait for the reservation to appear in the cell
    const reservedName = await within(availableTd).findByText('RemoveMe');
    const reservedCell = reservedName.parentElement;
    const removeIcon = reservedCell.querySelector('span[title="Make available"]');
    fireEvent.click(removeIcon);
    expect(screen.queryByText('RemoveMe')).not.toBeInTheDocument();
  });

  test('can add a reservation using the form in daily view', async () => {
    render(<App />);
    goToDayWithAvailableSlot();
    const addBtn = screen.getByRole('button', { name: /Add Reservation/i });
    fireEvent.click(addBtn);
    fireEvent.change(screen.getByLabelText(/Player Name/i), { target: { value: 'FormPlayer' } });
    fireEvent.click(screen.getByRole('button', { name: /Add/i }));
    // Wait for the reservation to appear anywhere
    await screen.findByText('FormPlayer');
  });

  test('weekly view calendar renders available and reserved slots', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /Weekly/i }));
    // Should show at least one available and one reserved slot (by name)
    expect(screen.getAllByText(/Available/i).length).toBeGreaterThan(0);
    // Find any name from the mock data
    const names = ["Alex", "Jordan", "Taylor", "Morgan", "Casey", "Riley", "Jamie", "Drew", "Sam", "Avery"];
    const found = names.some(name => screen.queryAllByText(name).length > 0);
    expect(found).toBe(true);
  });
});
