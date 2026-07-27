import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { PageState } from './PageState';

describe('PageState', () => {
  it('renders a compact state and handles its action', async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();

    render(
      <PageState
        compact
        title="Could not load content"
        message="Try the request again."
        action={<button onClick={onRetry}>Retry</button>}
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: 'Could not load content',
      }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(onRetry).toHaveBeenCalledOnce();
  });
});
