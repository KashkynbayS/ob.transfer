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
			path: '',
			name: 'TempMain',
			component: () => import('@/views/MainTempPage.vue')
		},
		{
			path: 'internal',
			name: 'Internal',
			component: () => import('@/views/Internal/Internal.vue'),
			children: [
				{
					path: 'phone',
					name: 'InternalPhone',
					component: () => import('@/views/Internal/internalPhone.vue')
				},
				{
					path: 'account',
					name: 'InternalAccount',
					component: () => import('@/views/Internal/internalIban.vue')
				}
			]
		},
		{
			path: 'own',
			name: 'Own',
			component: () => import('@/views/Own.vue')
		},
		{
			path: 'success',
			name: 'Success',
			component: () => import('@/views/Success.vue')
		}
	]
})

export default router
