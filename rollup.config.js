import typescript from 'rollup-plugin-typescript2';
import image from '@rollup/plugin-image';
import { terser } from 'rollup-plugin-terser';
import cleanup from 'rollup-plugin-cleanup';

export default {
  input: 'src/background.ts',
  output: {
    file: 'dist/background.js',
    format: 'iife',
    sourcemap: true
  },
  plugins: [
    typescript(),
    image(),
    cleanup(),
    terser({format: { comments: false }}),
 ],
  watch: {
      include: 'src/**'
  }
};
