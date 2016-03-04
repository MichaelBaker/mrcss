var path = require('path');

module.exports = {
    devtool: 'source-map',
    noParse: [
      path.resolve(__dirname, './node_modules/benchmark/benchmark.js')
    ],

    resolve: {
        root: [__dirname + '/src']
    },

    entry: {
        javascript: path.resolve(__dirname, 'benchmark/benchmark.es6')
    },

    output: {
        path:     path.resolve(__dirname, 'bench-dist'),
        filename: 'benchmark.js'
    },

    module: {
        loaders: [
            {
                test:    /\.es6$/,
                exclude: /node_modules/,
                loader:  'babel-loader',
                query:   {
                  cacheDirectory: true,
                  presets:        ['es2015', 'stage-1', 'react']
                }
            }
        ]
    }
};
