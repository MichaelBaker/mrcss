var webpack = require('webpack');
var path    = require('path');

module.exports = {
    resolve: {
        root: [__dirname + '/src']
    },

    entry: {
        javascript: path.resolve(__dirname, 'src/application.es6')
    },

    output: {
        path:     path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },

    plugins: [
        new webpack.optimize.CommonsChunkPlugin({ name: "vendor", filename: 'vendor.bundle.js' }),
        new webpack.optimize.CommonsChunkPlugin({ name: "mr-css", filename: 'mr-css.bundle.js' })
    ],

    module: {
        loaders: [
            {
                test:    /\.es6$/,
                exclude: /node_modules/,
                loader:  'babel-loader',
                query:   {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-1', 'react'],
                    plugins: ['babel-plugin-transform-decorators-legacy']
                }
            }
        ]
    }
};
