import svelte from 'rollup-plugin-svelte';
import sveltePreprocess from 'svelte-preprocess';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/plugin.ts',
  output: [
    {
      file: 'dist/plugin.js',
      format: 'iife',
      name: 'windyPlugin',
      exports: 'named',
      inlineDynamicImports: true,
      globals: {
        leaflet: 'L',
      },
    },
    {
      file: 'dist/plugin.min.js',
      format: 'iife',
      name: 'windyPlugin',
      exports: 'named',
      inlineDynamicImports: true,
      globals: {
        leaflet: 'L',
      },
      plugins: [
        terser({
          module: false,
        }),
      ],
    },
  ],
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
