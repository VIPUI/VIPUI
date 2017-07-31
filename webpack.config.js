module.exports = {
    entry: './src/scripts/vipui.ts',
    module: {
        rules: [{
            test: /\.tsx?$/,
            use: 'ts-loader',
            exclude: /node_modules/
        }]
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"]
    },
    output: {
        filename: './dist/js/vipui.js',
        path: __dirname
    }
};