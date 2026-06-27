/* eslint-env jest */
// Mock native-only modules so unit tests run in the Node/jsdom environment
// without a device. Pure-logic tests don't need these, but the App smoke test
// pulls them in transitively.

jest.mock('react-native-geolocation-service', () => ({
  __esModule: true,
  default: {
    getCurrentPosition: jest.fn(),
    requestAuthorization: jest.fn(),
  },
  getCurrentPosition: jest.fn(),
  requestAuthorization: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(() => Promise.resolve(null)),
    setItem: jest.fn(() => Promise.resolve()),
    removeItem: jest.fn(() => Promise.resolve()),
    clear: jest.fn(() => Promise.resolve()),
  },
}));

// The real Supabase client opens a realtime WebSocket on construction, which is
// unavailable in the Node test runtime. Stub the singleton for tests; data-layer
// logic (mappers, validation) is tested directly without it.
jest.mock('./src/lib/supabase', () => {
  const makeQuery = () => {
    const q = {
      select: jest.fn(() => q),
      eq: jest.fn(() => q),
      order: jest.fn(() => q),
      range: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      then: undefined,
    };
    return q;
  };
  return {
    supabase: {
      auth: {
        getSession: jest.fn(() =>
          Promise.resolve({ data: { session: null }, error: null }),
        ),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } },
        })),
        signInWithPassword: jest.fn(() =>
          Promise.resolve({ data: {}, error: null }),
        ),
        signUp: jest.fn(() => Promise.resolve({ data: {}, error: null })),
        signOut: jest.fn(() => Promise.resolve({ error: null })),
      },
      from: jest.fn(() => makeQuery()),
      rpc: jest.fn(() => Promise.resolve({ data: null, error: null })),
    },
  };
});
