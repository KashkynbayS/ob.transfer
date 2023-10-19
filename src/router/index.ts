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
		{
			path: '/:accountId',
			name: 'Internal',
			component: () => import('@/views/Internal/Internal.vue'),
			children: [
				{
					path: 'phone',
					name: 'InternalPhone',
					component: () => import('@/views/Internal/InternalPhone.vue')
				},
				{
					path: 'account',
					name: 'InternalAccount',
					component: () => import('@/views/Internal/InternalIban.vue')
				}
			]
		}
	]
})

export default router
