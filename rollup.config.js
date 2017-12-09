import nodeResolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import uglify from 'rollup-plugin-uglify';

const { BUILD_TYPE, NODE_ENV } = process.env;

const config = {
  input: 'src/index.js',
  plugins: [],
};

if (BUILD_TYPE === 'cjs') {
  config.output = { format: 'cjs' };
  config.plugins.push(nodeResolve(), babel());
}

if (BUILD_TYPE === 'umd') {
  config.output = { format: 'umd' };
  config.name = 'LightRPC';
  config.plugins.push(babel({ exclude: 'node_modules/**' }));
}

if (NODE_ENV === 'production') {
  config.plugins.push(uglify());
}

export default config;
