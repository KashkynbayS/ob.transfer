import { SseResponseStatusData } from '@/types'
import { defineStore } from 'pinia'

export const useStatusStore = defineStore('status', {
	state: (): SseResponseStatusData => ({
		class: 'success',
		title: '',
		showAs: 'fullpage',
		description: '',
		actions: []
	})
})
