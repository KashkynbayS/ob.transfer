import { CURRENCY_SYMBOL } from '@/constants'
import { CURRENCY, Tag } from '@/types'
import { useDateFormat } from '@vueuse/core'
import { defineStore } from 'pinia'
import { reactive } from 'vue'

export interface HistorySettings {
	currentFilter?: HistoryFilter
	dates: Date[]
	sum: {
		from: string
		to: string
	}
}

export type HistoryFilter = 'all' | 'executed' | 'rejected' | 'processing'

export interface Filter {
	id: HistoryFilter
	title: string
	value: HistoryFilter
	disabled: boolean
}

export const filters = reactive<Filter[]>([
	{ id: 'all', title: 'Все', value: 'all', disabled: false },
	{ id: 'executed', title: 'Исполнено', value: 'executed', disabled: false },
	{ id: 'rejected', title: 'Отклонено', value: 'rejected', disabled: false },
	{ id: 'processing', title: 'В обработке', value: 'processing', disabled: false }
])

interface HistorySchema {
	settings: HistorySettings
}

export const useHistoryStore = defineStore('history', {
	state: (): HistorySchema => ({
		settings: {
			currentFilter: undefined,
			dates: [],
			sum: {
				from: '',
				to: ''
			}
		}
	}),
	getters: {
		filterTags(): Tag[] {
			const tags = []

			if (this.settings.currentFilter) {
				tags.push({
					value: this.settings.currentFilter,
					title: filters.find((item) => item.id === this.settings.currentFilter)?.title || ''
				})
			}

			if (this.datesString) {
				console.log(this.datesString)
				tags.push({
					value: 'date',
					title: this.datesString
				})
			}

			const sumFrom = this.settings.sum.from
			const sumTo = this.settings.sum.to

			if (sumFrom || sumTo) {
				let tag

				if (sumFrom && sumTo) {
					tag = {
						value: `${sumFrom} - ${sumTo}`,
						title: `${sumFrom} ${CURRENCY_SYMBOL[CURRENCY.KZT]} - ${sumTo} ${CURRENCY_SYMBOL[CURRENCY.KZT]}`
					}
				} else if (sumFrom) {
					tag = {
						value: sumFrom,
						title: `от ${sumFrom} ${CURRENCY_SYMBOL[CURRENCY.KZT]}`
					}
				} else {
					tag = {
						value: sumTo,
						title: `до ${sumTo} ${CURRENCY_SYMBOL[CURRENCY.KZT]}`
					}
				}

				tags.push(tag)
			}

			return tags
		},
		datesString(): string {
			const dates = this.settings.dates
			return dates.length
				? `${useDateFormat(dates[0], 'DD.MM.YYYY').value} - ${useDateFormat(dates[1], 'DD.MM.YYYY').value}`
				: ''
		}
	},
	actions: {
		disableFilter(value: string) {
			if (filters.findIndex((item) => item.id === value) !== -1) {
				this.settings.currentFilter = undefined
			} else if (value === 'date') {
				this.settings.dates = []
				console.log(this.settings.dates)
			} else {
				this.settings.sum.from = ''
				this.settings.sum.to = ''
				console.log(this.settings.sum.from)
			}
		}
	}
})
