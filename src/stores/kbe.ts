import { KbeService } from '@/services/kbe.service'
import { Kbe } from '@/types/kbe'
import { defineStore } from 'pinia'

export interface KbeStore {
	loading: boolean
	list: Kbe[]
	fetched: Kbe[]
}

export const useKbeStore = defineStore('kbe', {
	state: (): KbeStore => ({
		loading: true,
		list: [],
		fetched: []
	}),
	actions: {
		fetchList() {
			this.loading = true
			KbeService.getList().then(({ data }) => {
				this.fetched = data
			})
		},
		searchKbe(search: string = '') {
			if (this.fetched.length === 0) {
				this.fetchList()
			}

			this.list = this.fetched.filter((item) => {
				return (
					item.nameRu.toLowerCase().includes(search.toLowerCase()) ||
					item.nameKz.toLowerCase().includes(search.toLowerCase()) ||
					item.code.toLowerCase().includes(search.toLowerCase()) ||
					item.parent.toLowerCase().includes(search.toLowerCase())
				)
			})
		}
	}
})
