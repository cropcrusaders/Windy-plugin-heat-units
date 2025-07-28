import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
  input: 'src/plugin.ts',
  output: {
    file: 'dist/plugin.js',
    format: 'iife',
    exports: 'named',
    name: 'windyPluginHeatUnits',
    globals: {
      leaflet: 'L'
    },
    inlineDynamicImports: true
  },
  plugins: [
    svelte({
      preprocess: sveltePreprocess(),
      compilerOptions: {
        dev: false,
      },
      emitCss: false,
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    typescript({
      sourceMap: false,
    }),
  ],
  external: ['leaflet'],
};
