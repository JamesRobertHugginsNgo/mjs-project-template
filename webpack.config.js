const path = require('path');

module.exports = {
	mode: 'development',
	entry: './dist/scripts/index.mjs',
	output: {
		path: path.resolve(__dirname, './dist/scripts'),
		filename: 'bundle.js'
	},
	module: {
		rules: [
			{
				test: /\.m?js$/,
				exclude: /(node_modules|bower_components)/,
				use: {
					loader: 'babel-loader'
				}
			}
		]
	}
};
