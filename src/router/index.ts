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
			name: 'Main',
			component: () => import('@/views/Main.vue'),
			children: [
				{
					path: 'new',
					name: 'New',
					component: () => import('@/views/Main/New.vue')
				},
				{
					path: 'frequent',
					name: 'Frequent',
					component: () => import('@/views/Main/Frequent.vue')
				}
			]
		},
		{
			path: 'internal',
			redirect: 'internal/phone',
			name: 'Internal',
			component: () => import('@/views/Internal.vue'),
			children: [
				{
					path: 'phone',
					name: 'InternalPhone',
					component: () => import('@/views/Internal/Phone.vue')
				},
				{
					path: 'account',
					name: 'InternalAccount',
					component: () => import('@/views/Internal/Iban.vue')
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
			component: () => import('@/views/Success.vue')
		},
		{
			path: 'history',
			name: 'History',
			component: () => import('@/views/History.vue')
		},
		{
			path: 'details/:transactionId',
			name: 'TransactionDetails',
			component: () => import('@/views/Details.vue')
		},
		{
			path: 'status',
			name: 'Status',
			component: () => import('@/views/StatusPage.vue')
		},
		{
			path: '/otp',
			name: 'OtpPage',
			component: () => import('@/views/OtpPage.vue')
		}
	]
})

export default router
