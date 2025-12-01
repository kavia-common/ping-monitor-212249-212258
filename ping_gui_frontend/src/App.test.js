import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app header and logs panel', () => {
  render(<App />);
  expect(screen.getByText(/Ping Monitor \(HTTP\/Sim\)/i)).toBeInTheDocument();
  expect(screen.getByText(/Logs/i)).toBeInTheDocument();
});
