import typescript from 'rollup-plugin-typescript2'
import sourceMaps from 'rollup-plugin-sourcemaps'
import { terser } from 'rollup-plugin-terser'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'

export default {
    input: './src/tank.ts',
    plugins: [
        typescript(),
        sourceMaps(),
        resolve({
            preferBuiltins: false
        }),
        commonjs({
            include: 'node_modules/**',
            // namedExports: {
            //     'node_modules/tape/index.js': [ 'createHarness', 'test', 'Test', 'test.skip' ]
            // }
        }),
        terser({
            mangle: true,
            compress: true,
        }),
    ],
    output: [
        {
            file: './build/assets/js/fishtank.js',
            format: 'iife',
            name: 'FishTank',
            sourcemap: false,
        }
    ],
    watch: {
        include: 'src/**/*.ts'
    }
}
