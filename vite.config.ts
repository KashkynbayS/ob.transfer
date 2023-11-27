import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		vue({
			template: {
				transformAssetUrls: {
					base: '/src'
				}
			}
		}),
		svgLoader({
			defaultImport: 'component', // or 'raw'
			svgoConfig: {
				multipass: true
			}
		})
	],
	resolve: {
		alias: {
			'@': '/src'
		}
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
		target: 'esnext'
	}
})
