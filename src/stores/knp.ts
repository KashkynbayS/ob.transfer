import { KnpService } from '@/services/knp.service'
import { Knp } from '@/types/knp'
import { defineStore } from 'pinia'

export interface KnpStore {
	loading: boolean
	list: Knp[]
	fetched: Knp[]
}

export const useKnpStore = defineStore('knp', {
	state: (): KnpStore => ({
		loading: true,
		list: [],
		fetched: []
	}),
	actions: {
		fetchList() {
			this.loading = true
			KnpService.getList().then(({ data }) => {
				this.fetched = data
			})
		},
		searchKnp(search: string = '') {
			if (this.fetched.length === 0) {
				this.fetchList()
			}

			this.list = this.fetched.filter((item) => {
				return (
					item.nameRu.toLowerCase().includes(search.toLowerCase()) ||
					item.nameKz.toLowerCase().includes(search.toLowerCase()) ||
					item.code.toLowerCase().includes(search.toLowerCase())
				)
			})
		}
	}
})
