var path = require('path');

module.exports = {
    devtool: 'source-map',

    resolve: {
        root: [__dirname + '/src']
    },

    entry: {
        javascript: path.resolve(__dirname, 'test/mrcss-selectors.es6')
    },

    output: {
        path:     path.resolve(__dirname, 'test-dist'),
        filename: 'test.js'
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
