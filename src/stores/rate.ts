import { defineStore } from 'pinia'

import { OwnService } from '@/services/own.service'
import { Rate } from '@/types'

export interface RateStore {
	loading: boolean
	rate: Rate | null
}

export const useRateStore = defineStore('rate', {
	state: (): RateStore => ({
		loading: true,
		rate: null
	}),
	actions: {
		fetchRate() {
			this.loading = true

			OwnService.fetchRate()
				.then((response) => {
					this.rate = response
				})
				.catch((error) => {
					this.rate = null
					console.log(error)
				})
				.finally(() => {
					this.loading = false
				})
		}
	}
})
