import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse, CURRENCY, Transaction, TransactionFromApi, TransactionGroup } from '@/types'

const { axiosInstance } = useAxiosInstance()

export const HistoryService = {
	async fetch(): Promise<TransactionGroup[]> {
		const response = await axiosInstance.get<BaseResponse<TransactionFromApi[]>>('main/history')
		return this.transformInputToOutput(response.data.data)
	},
	transformInputToOutput(input: TransactionFromApi[]): TransactionGroup[] {
		const output: TransactionGroup[] = []

		input.forEach((transfer) => {
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
}
