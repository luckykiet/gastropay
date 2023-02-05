import { render, screen } from '@testing-library/react';
import RootLayout from '../components/layouts/RootLayout';

test('renders learn react link', () => {
  render(<RootLayout />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
