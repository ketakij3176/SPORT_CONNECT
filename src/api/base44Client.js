import { createClient } from '@base44/sdk';
import { appParams } from '@/lib/app-params';

const { appId, token, functionsVersion, appBaseUrl } = appParams;

const hasValidAppConfig = Boolean(appId && functionsVersion && appBaseUrl);

const createMockBase44 = () => {
  const noop = () => {};
  const asyncNoop = async () => null;

  const mockEntityMethods = {
    list: async () => [],
    filter: async () => [],
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
  };

  const entitiesProxy = new Proxy(
    {},
    {
      get() {
        return mockEntityMethods;
      },
    },
  );

  return {
    auth: {
      me: asyncNoop,
      logout: noop,
      redirectToLogin: () => {
        if (typeof window !== 'undefined') {
          window.location.href = '/Landing';
        }
      },
    },
    entities: entitiesProxy,
  };
};

export const isBase44Configured = hasValidAppConfig;

export const base44 = isBase44Configured
  ? createClient({
      appId,
      token,
      functionsVersion,
      serverUrl: '',
      requiresAuth: false,
      appBaseUrl,
    })
  : createMockBase44();

