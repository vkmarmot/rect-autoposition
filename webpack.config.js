const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'lib'),
        filename: 'index.js',
        libraryTarget: 'commonjs',
        umdNamedDefine: true
    },
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js|jsx|tsx|ts)$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    },
    resolve: {
        extensions: ['*', '.js', '.ts'],
    },
    externals: [/^(@tmc\/)/i, /tactic/]
};
