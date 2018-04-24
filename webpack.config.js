const webpack = require('webpack');
const path = require('path');
const ClearPlugin = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const inProduction = process.env.NODE_ENV === 'production';

module.exports = {

    entry: {
        background: ['./src/background.js'],
        panel: [
            './src/panel/panel.scss',
            './src/panel/panel.html',
            './src/panel/panel.js',
        ],
    },

    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
    },

    module: {

        rules: [

            {
                test: /\.js$/,
                use: ['babel-loader', 'eslint-loader'],
                exclude: /node_modules/,
            },

            {
                test: /\.html$/,
                loader: 'file-loader',
                options: { name: '[name].html' },
                exclude: /node_modules/,
            },

            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                        options: { extractCSS: true },
                    },
                    'eslint-loader',
                ],
                exclude: /node_modules/,
            },

            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    {
                        loader: 'postcss-loader',
                        options: {
                            config: {
                                path: path.resolve(__dirname, 'src/styles'),
                            },
                        },
                    },
                    'sass-loader',
                ],
                exclude: /node_modules/,
            },

        ],

    },

    plugins: [
        new ClearPlugin(['build'], {
            dist: __dirname,
            verbose: true,
            dry: false,
        }),
        new MiniCssExtractPlugin('[name].css'),
        new webpack.LoaderOptionsPlugin({minimize: inProduction}),
    ],

    resolve: {
        extensions: ['*', '.js'],
    },

    // disable in dev mode as well because web extensions CSP don't allow using eval
    devtool: false,

};
