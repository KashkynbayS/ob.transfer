import { defineStore } from 'pinia'
import { object } from 'yup'

import { TransferService } from '@/services/transfer.service'
import { SseResponse, isLinkType, isStatusType } from '@/types'
import { FORM_STATE, FormStore } from '@/types/form'
import { OwnForm } from '@/types/own'
import { TypeOfTransfer } from '@/types/transfer'
import { getRelativeUrl } from '@/utils'
import { extractValidationErrors, validateAccount, validateAmount, validateWriteOffAmount } from '@/utils/validators'
import { useRouter } from 'vue-router'
import { useLoadingStore } from './loading'
import { useStatusStore } from './status'

const router = useRouter()

const { setLoading } = useLoadingStore()

export interface OwnStore extends FormStore {}

const formSchema = object({
	from: validateAccount('from', 'OWN.FORM.ERRORS.SELECT_ACCOUNT'),
	to: validateAccount('to', 'OWN.FORM.ERRORS.SELECT_ACCOUNT'),
	amount: validateAmount(
		'amount',
		'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'OWN.FORM.ERRORS.EMPTY_AMOUNT',
		'OWN.FORM.ERRORS.MIN_AMOUNT'
	),
	writeOffAmount: validateWriteOffAmount(
		'writeOffAmount',
		'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY',
		'OWN.FORM.ERRORS.EMPTY_AMOUNT',
		'OWN.FORM.ERRORS.MIN_AMOUNT'
	)
})

export const useOwnStore = defineStore('own', {
	state: (): OwnStore => ({
		state: FORM_STATE.INITIAL,
		applicationId: '',
		errors: {
			from: '',
			to: '',
			amount: '',
			writeOffAmount: ''
		}
	}),
	actions: {
		submitForm(form: OwnForm) {
			TransferService.initWithSSE(
				{
					iban: form.from!.iban,
					recIban: form.to!.iban,
					amount: String(form.amount),
					typeOfTransfer: TypeOfTransfer.BetweenMyAccounts
				},
				(event) => {
					setLoading(false)

					const eventData = JSON.parse(event.data) as SseResponse<'link' | 'status'>
					console.log('onmessage', eventData)

					if (isLinkType(eventData)) {
						if (eventData.data.target === '_blank') {
							window.open(eventData.data.url, '_blank')
						} else {
							const relativeUrl = getRelativeUrl(eventData.data.url)
							console.log('routing to ', relativeUrl)
							// noinspection JSIgnoredPromiseFromCall
							router.push(relativeUrl)
						}
					} else if (isStatusType(eventData)) {
						const statusStore = useStatusStore()

						statusStore.$state = eventData.data
						// noinspection JSIgnoredPromiseFromCall
						router.push({
							name: 'Status'
						})
					}
				}
			)
				.then((e) => {
					this.applicationId = e.applicationID
					this.state = FORM_STATE.SUCCESS
				})
				.catch(() => {
					this.state = FORM_STATE.ERROR
				})
		},
		validate(form: OwnForm) {
			this.clearErrors()
			this.state = FORM_STATE.LOADING

			formSchema
				.validate(form, {
					abortEarly: false,
					context: {
						fromAccount: form.from,
						toAccount: form.to,
						isSameCurrency: form.from?.currency === form.to?.currency
					}
				})
				.then(() => {
					this.submitForm(form)
				})
				.catch((err) => {
					console.log(err)
					this.state = FORM_STATE.INITIAL
					this.errors = extractValidationErrors(this.errors, err)
				})
		},
		clearErrors(fieldName?: any) {
			if (fieldName) {
				this.errors[fieldName] = ''
			} else {
				this.errors = {
					from: '',
					to: '',
					amount: '',
					writeOffAmount: ''
				}
			}
		}
	}
})
