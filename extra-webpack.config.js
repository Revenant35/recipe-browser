module.exports = (config, options, targetOptions) => {
  delete config.optimization;
  return {
    ...config,
    module: {
      rules: config.module.rules
    },
    resolve: config.resolve,
    plugins: config.plugins,
    output: {
      filename: config.filename,
      path: config.path,
      clean: true
    },
    experiments: {
      ...config.experiments,
      topLevelAwait: true
    },
    externals: {
      crypto: 'Crypto',
      stream: 'Stream',
      vm: 'VM'
    },
    resolveLoader: { symlinks: true },
    cache: config.cache,
    target: config.target,
    stats: config.stats,
    devtool: 'source-map',
    mode: 'development'
  };
};
