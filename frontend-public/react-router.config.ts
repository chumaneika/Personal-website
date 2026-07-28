import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'src',
  ssr: true,
  routeDiscovery: {
    mode: 'lazy',
  },
  future: {
    v8_splitRouteModules: true,
  },
} satisfies Config;
