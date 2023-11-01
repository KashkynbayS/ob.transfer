<script setup lang="ts">
import { reactive, computed, watchEffect } from 'vue'

import { Button, Input } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AppNavbar from '@/components/AppNavbar.vue'
import AccountDropdown from '@/components/AccountDropdown.vue'

import { ACCOUNTS_GROUPS } from '@/mocks/own'

import { Account, CURRENCY, CURRENCY_SYMBOL } from '@/types'

import { useRateStore } from '@/stores/rate.ts'

enum LAST_UPDATED {
	WRITE_OFF_AMOUNT = 'writeOffAmount',
	ENROLLMENT_AMOUNT = 'enrollmentAmount'
}

const currencies = {
	[CURRENCY.KZT]: 'OWN.CURRENCIES.KZT',
	[CURRENCY.USD]: 'OWN.CURRENCIES.USD'
}

const rateStore = useRateStore()

const form = reactive({
	from: undefined,
	to: undefined,
	amount: '',
	writeOffAmount: '',
	enrollmentAmount: '',
	lastUpdated: ''
})

function extractCurrencyFromAmount(account: Account) {
	return account ? currencies[account.currency] : ''
}

const hasDifferentCurrencies = computed(() => {
	if (!form.from || !form.to) {
		return false
	}

	return form.from?.currency !== form.to?.currency
})

const writeOffCurrency = computed(() => extractCurrencyFromAmount(form.from))
const enrollmentCurrency = computed(() => extractCurrencyFromAmount(form.to))
const rateHelperArgs = computed(() => {
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
	updateEnrollmentAmount(event.target.value)
	form.lastUpdated = LAST_UPDATED.WRITE_OFF_AMOUNT
}

const handleEnrollmentAmountChange = (event: InputEvent) => {
	updateWriteOffAmount(event.target.value)
	form.lastUpdated = LAST_UPDATED.ENROLLMENT_AMOUNT
}

const updateEnrollmentAmount = (value = form.writeOffAmount) => {
	if (rateStore.rate.from.currency === form.from.currency) {
		form.enrollmentAmount = value / rateStore.rate.from.amount
	} else {
		form.enrollmentAmount = value * rateStore.rate.from.amount
	}
}

const updateWriteOffAmount = (value = form.enrollmentAmount) => {
	if (rateStore.rate.to.currency === form.to.currency) {
		form.writeOffAmount = value * rateStore.rate.from.amount
	} else {
		form.writeOffAmount = value / rateStore.rate.from.amount
	}
}

watchEffect(() => {
	switch (form.lastUpdated) {
		case LAST_UPDATED.WRITE_OFF_AMOUNT:
			updateEnrollmentAmount()
			break

		case LAST_UPDATED.ENROLLMENT_AMOUNT:
			updateWriteOffAmount()
			break

		default:
			break
	}
}, [rateStore.rate])

watchEffect(() => {
	if (form.from?.currency === form.to?.currency) {
		return
	}

	rateStore.fetchRate()
}, [form.from, form.to])
</script>

<template>
	<PageTemplate>
		<AppNavbar>
			<template #title>
				<h5>{{ $t('OWN.TITLE') }}</h5>
			</template>
		</AppNavbar>

		<form class="form">
			<AccountDropdown
				id="from"
				v-model="form.from"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.FROM')"
				:disabled="form.to"
			/>
			<AccountDropdown
				id="to"
				v-model="form.to"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.TO')"
				:disabled="form.from"
			/>

			<template v-if="hasDifferentCurrencies">
				<Input
					id="writeOffAmount"
					v-model="form.writeOffAmount"
					:label="$t('OWN.FORM.WRITE_OFF_AMOUNT', { currency: $t(writeOffCurrency) })"
					@input="handleWriteOffAmountChange"
				/>
				<Input
					id="enrollmentAmount"
					v-model="form.enrollmentAmount"
					:label="$t('OWN.FORM.ENROLLMENT_AMOUNT', { currency: $t(enrollmentCurrency) })"
					:helper-text="$t('OWN.FORM.RATE', rateHelperArgs)"
					@input="handleEnrollmentAmountChange"
				/>
			</template>

			<template v-else>
				<Input
					id="amount"
					v-model="form.amount"
					:label="$t('OWN.FORM.AMOUNT')"
					:helper-text="$t('OWN.FORM.COMMISSION')"
				/>
			</template>

			<Button id="ownSubmit" class="form__submit" type="primary"> {{ $t('OWN.FORM.SUBMIT') }} </Button>
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
}

.form__submit {
	margin-top: auto;
}
</style>