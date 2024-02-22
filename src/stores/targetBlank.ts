import { defineStore } from 'pinia'

export const useTargetBlankStore = defineStore('targetBlank', {
	state: () => ({
		url: ''
	}),

	actions: {
		setUrl(value: string) {
			this.url = value
			console.log(this.url)
		}
	}
})
