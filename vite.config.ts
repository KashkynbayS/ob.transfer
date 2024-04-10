import vue from '@vitejs/plugin-vue'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue(),
		svgLoader({
			defaultImport: 'component',
			svgoConfig: {
				multipass: true,
				plugins: [
					{
						name: 'preset-default',
						params: {
							overrides: {
								removeViewBox: false
							}
						}
					}
				]
			}
		})
	],
	resolve: {
		alias: {
			'@': fileURLToPath(new URL('./src', import.meta.url))
		}
	},
	server: {
		port: 5000,
		host: true
	},
	base: '/app/bank/transfers',
	build: {
		emptyOutDir: true,
		rollupOptions: {
			input: '/src/main.ts',
			preserveEntrySignatures: 'strict',
			output: {
				format: 'system',
				assetFileNames: 'assets/[name].[ext]',
				chunkFileNames: 'chunks/[name].js',
				entryFileNames: '[name].js'
			}
			// external: ['vue', 'vue-router', 'vue-i18n', 'pinia']
		},
		sourcemap: true,
		target: 'esnext'
	}
})
