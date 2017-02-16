function glsl() {

	return {

		transform( code, id ) {

			if ( /\.glsl$/.test( id ) === false ) return;

			var transformedCode = 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' )
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' )
					.replace( /\n{2,}/g, '\n' )
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			};

		}

	};

}

export default {
	entry: 'src/szx3d.js',
	indent: '\t',
	plugins: [
		glsl()
	],
	// sourceMap: true,
	targets: [
		{
			format: 'umd',
			moduleName: 'SZX3D',
			dest: 'build/szx3d.js'
		},
		{
			format: 'es',
			dest: 'build/szx3d.module.js'
		}
	]
};
