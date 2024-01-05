import { CURRENCY_SYMBOL } from '@/constants'
import { CURRENCY, Tag, Transaction, TransactionFromApi, TransactionGroup } from '@/types'
import { useDateFormat } from '@vueuse/core'
import { defineStore } from 'pinia'
import { reactive } from 'vue'
import { HistoryService } from '@/services/history.service.ts'

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
	history: TransactionFromApi[]
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
		},
		history: []
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
		},
		getTransactionById() {
			return (transactionId: string) => this.history.find((transaction) => transaction.id === transactionId)
		},
		transformedHistory() {
			const output: TransactionGroup[] = []

			this.history.forEach((transfer) => {
				const date = new Date(transfer.createdAt)
				const today = new Date()
				const yesterday = new Date()
				yesterday.setDate(today.getDate() - 1)
				const dayBeforeYesterday = new Date()
				dayBeforeYesterday.setDate(today.getDate() - 2)

				let caption = ''
				if (date.toDateString() === yesterday.toDateString()) {
					caption = 'Вчера'
				} else if (date.toDateString() === dayBeforeYesterday.toDateString()) {
					caption = 'Позавчера'
				} else {
					const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
					caption = date.toLocaleDateString('ru-RU', options)
				}

				let group = output.find((g) => g.title === caption)

				if (!group) {
					group = {
						title: caption,
						list: []
					}
					output.push(group)
				}

				const outputTransfer: Transaction = {
					id: transfer.id,
					currency: CURRENCY.KZT, // todo Необходимо уточнить, откуда брать валюту
					caption: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
					value: transfer.amount,
					status: transfer.status,
					type: transfer.typeOfTransfer
				}

				if (transfer.commission) {
					outputTransfer.commission = parseFloat(transfer.commission)
				}

				group.list.push(outputTransfer)
			})

			return output
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
		},
		async fetchHistory() {
			this.history = await HistoryService.fetch()
		}
	}
})
