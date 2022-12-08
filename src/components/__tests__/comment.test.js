import * as React from 'react';
import { render, screen } from '@testing-library/react';
import Comment from '../comment';

jest.mock('javascript-time-ago', () => ({
  addDefaultLocale: () => {},
}));

test('renders comment text', () => {
  render(
    <Comment
      comment={{
        displayName: 'test_user',
        email: 'user@user.com',
        text: 'Wow! Thanks!',
        timestamp: Date.now(),
      }}
    />
  );

  const commentTextElement = screen.getByText('Wow! Thanks!');
  expect(commentTextElement).toBeInTheDocument();
});
