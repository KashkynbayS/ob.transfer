import { defineStore } from 'pinia'

export interface HistorySettings {
	filters: Record<HistoryFilter, boolean>
	dates?: string
	sum: {
		from?: number
		to?: number
	}
}

export type HistoryFilter = 'executed' | 'rejected' | 'processing'

interface HistorySchema {
	settings: HistorySettings
}

export const useHistoryStore = defineStore('history', {
	state: (): HistorySchema => ({
		settings: {
			filters: {
				executed: true,
				rejected: true,
				processing: true
			},
			dates: '',
			sum: {
				from: undefined,
				to: undefined
			}
		}
	}),
	getters: {},
	actions: {}
})
