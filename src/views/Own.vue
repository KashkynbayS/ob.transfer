<script setup lang="ts">
import { computed, onMounted, ref, watchEffect } from 'vue'

import { useRouter } from 'vue-router'

import { Button, CurrencyInput } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AccountDropdown from '@/components/AccountDropdown.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import Guard from '@/components/Guard.vue'

import { CURRENCY_SYMBOL } from '@/constants'
import { Account, AccountsGroup, CURRENCY, LAST_UPDATED, OwnForm } from '@/types'

import { validateOwnForm } from '@/helpers/own-form.helper'

import { handleTransferSSEResponse } from '@/services/sse.service.ts'
import { TransferService } from '@/services/transfer.service'

import { useLeaveConfirmedStore } from '@/stores/guard'
import { useLoadingStore } from '@/stores/loading'
import { useOwnStore } from '@/stores/own.ts'
import { useRateStore } from '@/stores/rate.ts'
import { useApplicationIDStore } from '@/stores/useApplicationIDStore'

import { FORM_STATE } from '@/types/form'
import { TypeOfTransfer } from '@/types/transfer'
import { extractCurrencyFromAmount } from '@/utils/currencies'

const router = useRouter()

const ownStore = useOwnStore()
const rateStore = useRateStore()
const applicationIDStore = useApplicationIDStore()
const leaveConfirmedStore = useLeaveConfirmedStore();

// временно отключаем по задаче: DBO-1037 - Отключение функционала Конвертации
const IS_CONVERSION_DISABLED = false

const { setLoading } = useLoadingStore()

ownStore.clearErrors()

const form = ref<OwnForm>({
	from: undefined,
	to: undefined,
	amount: null,
	writeOffAmount: '',
	enrollmentAmount: '',
	lastUpdated: undefined,
})

const myAccounts = ref<Account[]>([])

const myDeposits = ref<Account[]>([])

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
		return TypeOfTransfer.Conversion
	} else if (form.value.from?.displayName.includes('счет') && form.value.to?.displayName.includes('депозит')) {
		return TypeOfTransfer.DepositReplenishment
	} else {
		return TypeOfTransfer.DepositWithdrawal
	}
}

const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()

	try {
		await validateOwnForm(form.value)
		ownStore.clearErrors()
		ownStore.setState(FORM_STATE.LOADING)
		setLoading(true)
		leaveConfirmedStore.setIsLeaveConfirmed(true);

		// TO DO: вынести отдельно
		let selectedDepositNumber: string | undefined;
		let selectedDepositIban: string | undefined;

		if (form.value.from?.displayName.includes('депозит')) {
			selectedDepositNumber = form.value.from?.number;
			selectedDepositIban = form.value.from?.iban;
		}
		else if (form.value.to?.displayName.includes('депозит')) {
			selectedDepositNumber = form.value.to?.number;
			selectedDepositIban = form.value.to?.iban;
		}

		let selectedAccount: string | undefined;

		if (form.value.from?.displayName.includes('счет')) {
			selectedAccount = form.value.from?.iban;
		}
		else if (form.value.to?.displayName.includes('счет')) {
			selectedAccount = form.value.to?.iban;
		}

		TransferService.initWithSSE(
			{
				iban: selectedAccount!,
				depositNumber: selectedDepositNumber,
				recIban: selectedDepositIban,
				amount: String(form.value.amount),
				typeOfTransfer: determineTypeOfTransfer()
			},
			(event) => {
				handleTransferSSEResponse(form.value, event, router)
				setLoading(false)
			}
		)
			.then((e) => {
				ownStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
				// ownStore.setState(FORM_STATE.SUCCESS)
				applicationIDStore.setApplicationID(e.applicationID)
			})
			.catch(() => {
				// ownStore.setState(FORM_STATE.ERROR)

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

onMounted(async () => {
	const deals = await TransferService.fetchDealsList()

	myAccounts.value = deals.accounts.map((account) => ({
		id: account.id,
		currency: account.currency.name.toLowerCase() as CURRENCY,
		iban: account.accNumber,
		title: `ACCOUNTS_GROUPS.ACCOUNT_${account.currency.name.toUpperCase()}`,
		amount: account.amount,
		displayName: account.displayName
	}))

	myDeposits.value = deals.deposits.map((deposit) => ({
		id: deposit.id,
		currency: deposit.currency.name.toLowerCase() as CURRENCY,
		iban: deposit.accountNumber,
		number: deposit.number,
		title: `ACCOUNTS_GROUPS.DEPOSIT`,
		amount: deposit.restHoldSum,
		displayName: deposit.displayName
	}))
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
			<AccountDropdown id="from" v-model="form.from" :accounts-groups="accountsGroups" :label="$t('OWN.FORM.FROM')"
				:disabled="form.to" :error-invalid="!!ownStore.errors.from"
				:helper-text="!!ownStore.errors.from ? $t(ownStore.errors.from) : ''"
				:update-field="() => handleSelectsUpdate('from')" />
			<AccountDropdown id="to" v-model="form.to" :accounts-groups="accountsGroups" :label="$t('OWN.FORM.TO')"
				:disabled="form.from" :error-invalid="!!ownStore.errors.to"
				:helper-text="!!ownStore.errors.to ? $t(ownStore.errors.to) : ''"
				:update-field="() => handleSelectsUpdate('to')" />

			<template v-if="hasDifferentCurrencies">
				<CurrencyInput id="writeOffAmount" v-model="form.writeOffAmount"
					:label="$t('OWN.FORM.WRITE_OFF_AMOUNT', { currency: $t(writeOffCurrency) })"
					:invalid="!!ownStore.errors.writeOffAmount"
					:helper-text="ownStore.errors.writeOffAmount ? $t(ownStore.errors.writeOffAmount) : ''"
					@input="handleWriteOffAmountChange" @update:model-value="ownStore.clearErrors('writeOffAmount')" />
				<CurrencyInput id="enrollmentAmount" v-model="form.enrollmentAmount"
					:label="$t('OWN.FORM.ENROLLMENT_AMOUNT', { currency: $t(enrollmentCurrency) })"
					:helper-text="$t('OWN.FORM.RATE', rateHelperArgs)" @input="handleEnrollmentAmountChange" />
			</template>

			<template v-else>
				<CurrencyInput id="amount" v-model="form.amount" :label="$t('OWN.FORM.AMOUNT')"
					:invalid="!!ownStore.errors.amount"
					:helper-text="ownStore.errors.amount ? $t(ownStore.errors.amount) : $t('OWN.FORM.COMMISSION', rateHelperArgs)"
					@update:model-value="ownStore.clearErrors('amount')" />
			</template>

			<Button id="ownSubmit" class="form__submit" type="primary" attr-type="submit">
				{{ $t('OWN.FORM.SUBMIT') }}
			</Button>
		</form>

		<Guard :form="form" />
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
