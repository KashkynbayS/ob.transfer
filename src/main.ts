import { createPinia } from 'pinia'
import { createApp, h } from 'vue'

import singleSpa from 'single-spa-vue'
import VOtpInput from 'vue3-otp-input'

import App from './App.vue'
import { router } from './router'

import '@ui-kit/kmf-styles/dist/index.css'
import '@ui-kit/ui-kit/dist/style.css'
import './style.css'

const pinia = createPinia()

const isLocal = import.meta.env.VITE_ENVIRONMENT === 'local'

let app = null
let vueLifecycles = null

if (isLocal) {
	app = createApp(App)

	// Plugins
	app.use(pinia)
	app.use(router)

	// Mount
	app.component('VOtpInput', VOtpInput)
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
		}
	})
}

export const bootstrap = vueLifecycles ? vueLifecycles.bootstrap : ''
export const mount = vueLifecycles ? vueLifecycles.mount : ''
export const unmount = vueLifecycles ? vueLifecycles.unmount : ''
