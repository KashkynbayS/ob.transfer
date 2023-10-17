import { h, resolveComponent } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

export const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: []
})

router.addRoute({
	path: '/',
	component: {
		render() {
			return h(resolveComponent('router-view'))
		}
	},
	children: [
		// {
		// 	path: '',
		// 	name: 'TempMain',
		// 	component: () => import('@/views/MainTempPage.vue')
		// }
	]
})

export default router
