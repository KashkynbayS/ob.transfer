import { CURRENCY_SYMBOL } from '@/constants'
import { HistoryService } from '@/services/history.service.ts'
import { useLoadingStore } from '@/stores/loading.ts'
import { BaseError, CURRENCY, HistoryGroup, HistoryItem, HistoryParams, Tag } from '@/types'
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

export type HistoryFilter = 'all' | 'success' | 'denied' | 'in_progress'

export interface Filter {
	id: HistoryFilter
	title: string
	value: HistoryFilter
	disabled: boolean
}

export const filters = reactive<Filter[]>([
	{ id: 'all', title: 'HISTORY.FILTER.ALL', value: 'all', disabled: false },
	{ id: 'success', title: 'HISTORY.STATUS.COMPLETED', value: 'success', disabled: false },
	{ id: 'denied', title: 'HISTORY.STATUS.REJECTED', value: 'denied', disabled: false },
	{ id: 'in_progress', title: 'HISTORY.STATUS.IN_PROCESSING', value: 'in_progress', disabled: false }
])

interface HistorySchema {
	settings: HistorySettings
	history: HistoryItem[]
	errorMsg: string
}

const loadingStore = useLoadingStore()

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
		history: [],
		errorMsg: ''
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
			const output: HistoryGroup[] = []

			this.history.forEach((transfer) => {
				const date = new Date(transfer.createdAt)
				const today = new Date()

				const yesterday = new Date()
				yesterday.setDate(today.getDate() - 1)

				const dayBeforeYesterday = new Date()
				dayBeforeYesterday.setDate(today.getDate() - 2)

				let title = ''
				let isTitleWithTranslation = false;

				if (date.toDateString() === yesterday.toDateString()) {
					title = 'HISTORY.YESTERDAY'
					isTitleWithTranslation = true;
				} else if (date.toDateString() === dayBeforeYesterday.toDateString()) {
					title = 'HISTORY.DAY_BEFORE_YESTERDAY'
					isTitleWithTranslation = true;
				} else {
					const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long' }
					title = date.toLocaleDateString('ru-RU', options)
				}

				let group = output.find((g) => g.title === title)

				if (!group) {
					group = {
						title,
						isTitleWithTranslation,
						list: []
					}
					output.push(group)
				}

				group.list.push(transfer)
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
			} else {
				this.settings.sum.from = ''
				this.settings.sum.to = ''
			}

			this.fetchHistory()
		},
		async fetchHistory() {
			loadingStore.setLoading(true)

			try {
				const filters: HistoryParams = {}

				if (this.settings.sum.from) filters.minAmount = this.settings.sum.from
				if (this.settings.sum.to) filters.maxAmount = this.settings.sum.to

				if (this.settings.currentFilter && this.settings.currentFilter !== 'all') {
					filters.status = this.settings.currentFilter
				}

				const startDate = this.settings.dates[0]?.toISOString().split('T')[0]
				const endDate = this.settings.dates[1]?.toISOString().split('T')[0]

				if (startDate) filters.startDate = startDate
				if (endDate) filters.startDate = endDate

				this.history = await HistoryService.fetch(filters)

				this.errorMsg = ''
			} catch (e: any) {
				if (e.response) {
					const errorResponse = e.response.data as BaseError
					this.errorMsg = errorResponse.msg
				} else {
					console.error('Произошла неизвестная ошибка', e)
				}
			} finally {
				loadingStore.setLoading(false)
			}
		}
	}
})
