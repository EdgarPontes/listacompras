import { renderHook, waitFor } from '@testing-library/react';
import { useApi } from './useApi';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('useApi', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should return data after a successful fetch', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'success' }),
      } as Response)
    );

    const { result } = renderHook(() => useApi('/api/lists'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ message: 'success' });
    expect(result.current.error).toBeNull();

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/forward?url=%2Fapi%2Flists',
      {}
    );
  });

  it('should handle fetch errors', async () => {
    mockFetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: 'Failed to fetch' }),
      } as Response)
    );

    const { result } = renderHook(() => useApi('/api/lists'));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBeNull();
    expect(result.current.error).toBeInstanceOf(Error);

    expect(mockFetch).toHaveBeenCalledWith(
      '/api/forward?url=%2Fapi%2Flists',
      {}
    );
  });
});
