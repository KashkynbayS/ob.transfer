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
			redirect: 'new',
			name: 'MainTransfer',
			component: () => import('@/views/MainTransfer/MainTransfer.vue'),
			children: [
				{
					path: 'new',
					name: 'New',
					component: () => import('@/views/MainTransfer/New.vue')
				},
				{
					path: 'frequent',
					name: 'Frequent',
					component: () => import('@/views/MainTransfer/Frequent.vue')
				}
			]
		},
		{
			path: 'internal',
			redirect: 'internal/phone',
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
			path: 'external',
			name: 'External',
			component: () => import('@/views/External.vue')
		},
		{
			path: 'success',
			name: 'Success',
			props: true,
			component: () => import('@/views/Success.vue')
		}
	]
})

export default router
