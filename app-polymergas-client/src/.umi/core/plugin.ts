import { Plugin } from 'D:/PDP/Projects/app-polymergas/app-polymergas-client/node_modules/@umijs/runtime';

const plugin = new Plugin({
  validKeys: ['patchRoutes','rootContainer','render','onRouteChange','dva','getInitialState','locale','locale','request',],
});
plugin.register({
  apply: require('D:/PDP/Projects/app-polymergas/app-polymergas-client/src/.umi/plugin-dva/runtime.tsx'),
  path: 'D:/PDP/Projects/app-polymergas/app-polymergas-client/src/.umi/plugin-dva/runtime.tsx',
});
plugin.register({
  apply: require('../plugin-initial-state/runtime'),
  path: '../plugin-initial-state/runtime',
});
plugin.register({
  apply: require('D:/PDP/Projects/app-polymergas/app-polymergas-client/src/.umi/plugin-locale/runtime.tsx'),
  path: 'D:/PDP/Projects/app-polymergas/app-polymergas-client/src/.umi/plugin-locale/runtime.tsx',
});
plugin.register({
  apply: require('../plugin-model/runtime'),
  path: '../plugin-model/runtime',
});

export { plugin };
