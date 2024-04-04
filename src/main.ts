import { createPinia } from 'pinia'
import { createApp, h } from 'vue'
import { i18nPlugin } from './i18n'

import singleSpa from 'single-spa-vue'

import App from './App.vue'
import { router } from './router'

import '@ui-kit/ui-kit/index.css'

import './style.css'
import axiosInstance from '@/api/api.instance.ts'
import { loggerPlugin } from '@ui-kit/ui-kit'

const pinia = createPinia()

const isLocal = import.meta.env.VITE_ENVIRONMENT === 'local'

let app = null
let vueLifecycles = null

if (isLocal) {
	app = createApp(App)

	// Plugins
	app.use(pinia)
	app.use(router)
	app.use(i18nPlugin)
	app.use(loggerPlugin, {
		axios: axiosInstance
	})

	// Mount
	app.mount('#app')
} else {
	vueLifecycles = singleSpa({
		createApp,
		appOptions: {
			render() {
				return h(App)
			}
		},
		handleInstance: (app) => {
			app.use(pinia)
			app.use(router)
			app.use(i18nPlugin)
			app.use(loggerPlugin, {
				axios: axiosInstance
			})
		}
	})
}

export const bootstrap = vueLifecycles ? vueLifecycles.bootstrap : ''
export const mount = vueLifecycles ? vueLifecycles.mount : ''
export const unmount = vueLifecycles ? vueLifecycles.unmount : ''
