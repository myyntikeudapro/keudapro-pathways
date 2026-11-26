import { describe, expect, it, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useCustomers } from './useCustomers';

const mock = vi.hoisted(() => ({ from: vi.fn() }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: mock.from } }));
const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>;

describe('read-only customer loading', () => {
  it('fetches unlinked leads even when no organization has been created', async () => {
    const lead = { id: 'unlinked', organization_id: null, mt_personal: false };
    mock.from.mockImplementation((table: string) => {
      const chain = { select: vi.fn(), eq: vi.fn(), order: vi.fn(), range: vi.fn().mockResolvedValue({ data: table === 'booking_requests' ? [lead] : [], error: null }) };
      chain.select.mockReturnValue(chain); chain.eq.mockReturnValue(chain); chain.order.mockReturnValue(chain);
      return chain;
    });
    const { result } = renderHook(() => useCustomers(true), { wrapper });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.organizations).toEqual([]);
    expect(result.current.data?.leads.map(l => l.id)).toEqual(['unlinked']);
    expect(mock.from).toHaveBeenCalledWith('booking_requests');
  });
  it('performs no customer reads without staff access', () => {
    mock.from.mockClear();
    const { result } = renderHook(() => useCustomers(false), { wrapper });
    expect(result.current.fetchStatus).toBe('idle');
    expect(mock.from).not.toHaveBeenCalled();
  });
});