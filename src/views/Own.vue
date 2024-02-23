<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect } from 'vue'

import { useRouter } from 'vue-router'

import { Button, CurrencyInput } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AccountDropdown from '@/components/AccountDropdown.vue'
import AppNavbar from '@/components/AppNavbar.vue'

import { CURRENCY_SYMBOL } from '@/constants'
import { Account, AccountsGroup, CURRENCY, LAST_UPDATED, OwnForm } from '@/types'

import { validateOwnForm } from '@/helpers/own-form.helper'

import { handleTransferSSEResponse } from '@/services/sse.service.ts'
import { TransferService } from '@/services/transfer.service'

// import { useLoadingStore } from '@/stores/loading'
import { useOwnStore } from '@/stores/own.ts'
import { useRateStore } from '@/stores/rate.ts'
import { useStatusStore } from '@/stores/status'
import { useSuccessStore } from '@/stores/success'
import { useApplicationIDStore } from '@/stores/useApplicationIDStore'

import { FORM_STATE } from '@/types/form'
import { TypeOfTransfer } from '@/types/transfer'
import { extractCurrencyFromAmount } from '@/utils/currencies'

const router = useRouter()

const ownStore = useOwnStore()
const successStore = useSuccessStore()
const rateStore = useRateStore()
const statusStore = useStatusStore()
const applicationIDStore = useApplicationIDStore()

// временно отключаем по задаче: DBO-1037 - Отключение функционала Конвертации
const IS_CONVERSION_DISABLED = false

// const { setLoading } = useLoadingStore()

ownStore.clearErrors()

const form = ref<OwnForm>({
	from: undefined,
	to: undefined,
	amount: null,
	writeOffAmount: '',
	enrollmentAmount: '',
	lastUpdated: undefined,
	transferType: 'own',
	receiverName: 'Между своими счетами'
})

const myAccounts = ref<Account[]>([
	{
		id: 'kzt-account',
		currency: CURRENCY.KZT,
		amount: 389000.01,
		iban: 'KZ84888AB22040000174',
		title: 'ACCOUNTS_GROUPS.ACCOUNT_KZT'
	}
])

const myDeposits = ref<Account[]>([
	{
		id: 'kzt-deposit',
		currency: CURRENCY.KZT,
		amount: 1345098.45,
		iban: 'KZ34888AB22060000146',
		title: 'ACCOUNTS_GROUPS.DEPOSIT_KZT'
	}
])

const accountsGroups = computed<AccountsGroup[]>(() => [
	{
		id: 'my-accounts',
		title: 'ACCOUNTS_GROUPS.MY_ACCOUNTS',
		list: myAccounts.value
	},
	{
		id: 'my-deposits',
		title: 'ACCOUNTS_GROUPS.MY_DEPOSITS',
		list: myDeposits.value
	}
])

const hasDifferentCurrencies = computed(() => {
	if (IS_CONVERSION_DISABLED) {
		return false
	}

	if (!form.value.from || !form.value.to) {
		return false
	}

	ownStore.clearErrors()

	return form.value.from.currency !== form.value.to.currency
})

const writeOffCurrency = computed(() => extractCurrencyFromAmount(form.value.from))
const enrollmentCurrency = computed(() => extractCurrencyFromAmount(form.value.to))
const rateHelperArgs = computed(() => {
	if (!rateStore.rate) {
		return {
			from: '',
			to: ''
		}
	}

	const { from, to } = rateStore.rate

	if (!from || !to) {
		return {
			from: '',
			to: ''
		}
	}

	return from.amount < to.amount
		? {
				from: `${from.amount} ${CURRENCY_SYMBOL[from.currency]}`,
				to: `${to.amount} ${CURRENCY_SYMBOL[to.currency]}`
		  }
		: {
				to: `${from.amount} ${CURRENCY_SYMBOL[from.currency]}`,
				from: `${to.amount} ${CURRENCY_SYMBOL[to.currency]}`
		  }
})

const handleWriteOffAmountChange = (event: InputEvent) => {
	ownStore.clearErrors()

	const target = event.target as HTMLInputElement
	updateEnrollmentAmount(target.value)
	form.value.lastUpdated = LAST_UPDATED.WRITE_OFF_AMOUNT
}

const handleEnrollmentAmountChange = (event: InputEvent) => {
	ownStore.clearErrors()

	const target = event.target as HTMLInputElement
	updateWriteOffAmount(target.value)
	form.value.lastUpdated = LAST_UPDATED.ENROLLMENT_AMOUNT
}

// TO DO Вынести отдельно
const determineTypeOfTransfer = () => {
	if (form.value.from?.currency !== form.value.to?.currency) {
		return TypeOfTransfer.BetweenMyAccountsConversionUSD
	} else if (form.value.from?.id === 'kzt-account' && form.value.to?.id === 'kzt-deposit') {
		return TypeOfTransfer.BetweenMyAccountsDepositReplenishment
	} else {
		return TypeOfTransfer.BetweenMyAccountsWithdrawalFromDeposit
	}
}

const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()

	try {
		// setLoading(true)
		await validateOwnForm(form.value)
		ownStore.clearErrors()
		ownStore.setState(FORM_STATE.LOADING)

		// Mock for UL
		TransferService.initWithSSE(
			{
				iban:"KZ84888AB22040000174",
    			depositNumber: "10-24/KMF01FL-00118",
				recIban: "KZ34888AB22060000146",
				amount: String(form.value.amount),
				typeOfTransfer: determineTypeOfTransfer()
				
				// iban: form.value.from!.iban,
				// recIban: form.value.to!.iban,
				// amount: String(form.value.amount),
				// recMobileNumber: '77772165656',
				// typeOfTransfer: 2
			},
			(event) => {
				handleTransferSSEResponse(form.value, event, router)
			}
		)
			.then((e) => {
				ownStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
				ownStore.setState(FORM_STATE.SUCCESS)
				applicationIDStore.setApplicationID(e.applicationID)
			})
			.catch(() => {
				ownStore.setState(FORM_STATE.ERROR)
			})
	} catch (err) {
		ownStore.setState(FORM_STATE.INITIAL)
		ownStore.setValidationError(err)
	}

	try {
		//FIXME i guess this is no longer actual ? if no, please uncomment line below
	} catch (error) {
		console.error('Ошибка при добавлении в избранное:', error)
	}
}

const handleSelectsUpdate = (value: string) => {
	ownStore.clearErrors(value)
}

const updateEnrollmentAmount = (value = form.value.writeOffAmount) => {
	if (!rateStore.rate || !value || !form.value.from) {
		return
	}

	const enteredAmount = Number(value)

	if (isNaN(enteredAmount)) {
		return
	}

	const rateAmount = rateStore.rate.from.amount
	let res

	if (rateStore.rate.from.currency === form.value.from.currency) {
		res = enteredAmount / rateAmount
	} else {
		res = enteredAmount * rateAmount
	}

	form.value.enrollmentAmount = res.toString()
}

const updateWriteOffAmount = (value = form.value.enrollmentAmount) => {
	if (!rateStore.rate || !value || !form.value.to) {
		return
	}

	const numbered = Number(value)

	if (isNaN(numbered)) {
		return
	}

	const rateAmount = rateStore.rate.from.amount
	let res

	if (rateStore.rate.to.currency === form.value.to.currency) {
		res = numbered * rateAmount
	} else {
		res = numbered / rateAmount
	}

	form.value.writeOffAmount = res.toString()
}

watchEffect(() => {
	switch (form.value.lastUpdated) {
		case LAST_UPDATED.WRITE_OFF_AMOUNT:
			updateEnrollmentAmount()
			break

		case LAST_UPDATED.ENROLLMENT_AMOUNT:
			updateWriteOffAmount()
			break

		default:
			break
	}
})

watchEffect(() => {
	if (form.value.from?.currency === form.value.to?.currency) {
		return
	}

	rateStore.fetchRate()
})

watch(
	() => ownStore.state,
	(state) => {
		switch (state) {
			case FORM_STATE.SUCCESS:
				successStore.setDetails(Number(form.value.amount), form.value.from?.currency || CURRENCY.KZT, [
					{ name: 'Сумма списания', value: '100 $' },
					{ name: 'Статус', value: 'Исполнено', colored: true },
					{ name: 'Номер квитанции', value: '56789900' },
					{ name: 'Счет списания', value: 'KZ****4893' },
					{ name: 'Счет зачисления', value: 'KZ****4893' },
					{ name: 'Дата', value: '11.04.2023' }
				])
				router.push('Success')
				break

			case FORM_STATE.ERROR:
				statusStore.$state = {
					class: 'error',
					title: 'Перевод не совершён',
					description: 'Ошибка',
					showAs: 'fullpage',
					actions: [
						{
							title: 'Вернуться на главную',
							type: 'secondary',
							target: '_self',
							url: 'https://online-dev.kmf.kz/app/bank/actions/close'
						},
						{ title: 'Обновить документ', type: 'primary', target: '_self', url: '' }
					]
				}
				router.push({
					name: 'Status'
				})
				break

			case FORM_STATE.INITIAL:
			default:
				break
		}
		if (state) {
			console.log(state)
		}
	}
)

onMounted(async () => {
	// const deals = await TransferService.fetchDealsList()

	// myAccounts.value = deals.accounts.map((account) => ({
	// 	id: account.id,
	// 	currency: account.currency.name.toLowerCase() as CURRENCY,
	// 	iban: account.accNumber,
	// 	title: `ACCOUNTS_GROUPS.ACCOUNT_${account.currency.name.toUpperCase()}`,
	// 	amount: account.amount
	// }))
})
</script>

<template>
	<PageTemplate :without-paddings="true">
		<template #header>
			<AppNavbar>
				<template #title>
					<h5>{{ $t('OWN.TITLE') }}</h5>
				</template>
			</AppNavbar>
		</template>

		<form class="form" @submit="handleSubmit">
			<AccountDropdown
				id="from"
				v-model="form.from"
				:accounts-groups="accountsGroups"
				:label="$t('OWN.FORM.FROM')"
				:disabled="form.to"
				:error-invalid="!!ownStore.errors.from"
				:helper-text="!!ownStore.errors.from ? $t(ownStore.errors.from) : ''"
				:update-field="() => handleSelectsUpdate('from')"
			/>
			<AccountDropdown
				id="to"
				v-model="form.to"
				:accounts-groups="accountsGroups"
				:label="$t('OWN.FORM.TO')"
				:disabled="form.from"
				:error-invalid="!!ownStore.errors.to"
				:helper-text="!!ownStore.errors.to ? $t(ownStore.errors.to) : ''"
				:update-field="() => handleSelectsUpdate('to')"
			/>

			<template v-if="hasDifferentCurrencies">
				<CurrencyInput
					id="writeOffAmount"
					v-model="form.writeOffAmount"
					:label="$t('OWN.FORM.WRITE_OFF_AMOUNT', { currency: $t(writeOffCurrency) })"
					:invalid="!!ownStore.errors.writeOffAmount"
					:helper-text="ownStore.errors.writeOffAmount ? $t(ownStore.errors.writeOffAmount) : ''"
					@input="handleWriteOffAmountChange"
					@update:model-value="ownStore.clearErrors('writeOffAmount')"
				/>
				<CurrencyInput
					id="enrollmentAmount"
					v-model="form.enrollmentAmount"
					:label="$t('OWN.FORM.ENROLLMENT_AMOUNT', { currency: $t(enrollmentCurrency) })"
					:helper-text="$t('OWN.FORM.RATE', rateHelperArgs)"
					@input="handleEnrollmentAmountChange"
				/>
			</template>

			<template v-else>
				<CurrencyInput
					id="amount"
					v-model="form.amount"
					:label="$t('OWN.FORM.AMOUNT')"
					:invalid="!!ownStore.errors.amount"
					:helper-text="ownStore.errors.amount ? $t(ownStore.errors.amount) : $t('OWN.FORM.COMMISSION', rateHelperArgs)"
					@update:model-value="ownStore.clearErrors('amount')"
				/>
			</template>

			<Button id="ownSubmit" class="form__submit" type="primary" attr-type="submit" @click="handleSubmit">
				{{ $t('OWN.FORM.SUBMIT') }}
			</Button>
		</form>
	</PageTemplate>
</template>

<style scoped>
.form {
	width: 100%;
	height: 100%;
	flex-direction: column;
	display: flex;
	gap: var(--space-3);
	padding: var(--space-4) 0;
}

.form__submit {
	margin-top: auto;
}
</style>
