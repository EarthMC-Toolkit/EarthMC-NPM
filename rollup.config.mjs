import pkg from './package.json' assert { type: 'json' }
import json from '@rollup/plugin-json'

import resolve from '@rollup/plugin-node-resolve'
import esbuild from 'rollup-plugin-esbuild'
import commonjs from '@rollup/plugin-commonjs'

import { typescriptPaths } from 'rollup-plugin-typescript-paths'

import nodePolyfills from 'rollup-plugin-polyfill-node'
//import dts from 'rollup-plugin-dts'

const generatedCode = {
    arrowFunctions: true,
    constBindings: true,
    objectShorthand: true
}

const esm = {
    generatedCode,
    file: pkg.exports.import,
    format: 'es'
}

const umd = {
    generatedCode,
    file: pkg.exports.require,
    format: 'umd',
    name: 'earthmc',
    globals: {
        'mojang-lib': 'mojanglib',
        'timed-cache': 'timedcache'
    }
}

const source = {
	input: 'src/main.ts',
	external: [...Object.keys(pkg.dependencies)],
    output: [esm, umd],
    plugins: [
        json(),
        nodePolyfills(),
        typescriptPaths({ preserveExtensions: true }),
        resolve({ preferBuiltins: true }),
        commonjs({ requireReturnsDefault: 'auto' }),
        esbuild({ exclude: ["**/*.test.ts"] })
    ]
}

// const types = {
//     input: 'src/types/index.ts',
//     output: [{ 
//         file: pkg.types, 
//         format: 'es'
//     }],
//     plugins: [dts()]
// }

export default [source]