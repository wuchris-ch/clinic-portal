import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act } from 'react';

import { VacationRequestForm } from '@/components/vacation-request-form';

vi.mock('next/navigation', () => {
  return {
    useRouter: () => ({
      refresh: vi.fn(),
    }),
  };
});

vi.mock('@/lib/supabase/client', () => {
  return {
    createClient: () => ({}),
  };
});

vi.mock('sonner', () => {
  return {
    toast: {
      error: vi.fn(),
      success: vi.fn(),
    },
  };
});

describe('VacationRequestForm', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    // Required by React to enable act() warnings/behavior in tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it('shows the 72-hour reply notice near submit', () => {
    act(() => {
      root.render(
        <VacationRequestForm
          payPeriods={[]}
          userEmail="test@example.com"
          userName="Test User"
        />
      );
    });

    expect(container.textContent).toContain(
      'We will reply by email, within 72 hours of your submission. You will receive a reply at the email you entered above.'
    );
  });

  it('uses "Submit Request" as the submit button label', () => {
    act(() => {
      root.render(
        <VacationRequestForm
          payPeriods={[]}
          userEmail="test@example.com"
          userName="Test User"
        />
      );
    });

    const submitButton = container.querySelector('button[type="submit"]');
    expect(submitButton).toBeTruthy();
    expect(submitButton?.textContent || '').toMatch(/submit request/i);
  });
});
