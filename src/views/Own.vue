<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import { object, string, ValidationError } from 'yup'

import { Button, Input } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AccountDropdown from '@/components/AccountDropdown.vue'
import AppNavbar from '@/components/AppNavbar.vue'

import { ACCOUNTS_GROUPS } from '@/mocks/own'

import { CURRENCY_SYMBOL } from '@/constants'
import { LAST_UPDATED, OwnForm } from '@/types'

import { useRateStore } from '@/stores/rate.ts'
import { extractCurrencyFromAmount } from '@/utils/currencies'

const formSchema = object<{
	amount: string
	writeOffAmount: string
}>({
	amount: string().test('amount', 'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY', (value) => {
		if (!form.value.from || !value) {
			return false
		}
		return form.value.from?.amount >= Number(value)
	}),
	writeOffAmount: string().test('writeOffAmount', 'OWN.FORM.ERRORS.NOT_ENOUGH_MONEY', (value) => {
		if (!form.value.from || !value) {
			return false
		}
		return form.value.from?.amount >= Number(value)
	})
})

const rateStore = useRateStore()

const errors = ref({
	amount: '',
	writeOffAmount: ''
})

const form = ref<OwnForm>({
	from: undefined,
	to: undefined,
	amount: '',
	writeOffAmount: '',
	enrollmentAmount: '',
	lastUpdated: undefined
})

const hasDifferentCurrencies = computed(() => {
	if (!form.value.from || !form.value.to) {
		return false
	}

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
	const target = event.target as HTMLInputElement
	updateEnrollmentAmount(target.value)
	form.value.lastUpdated = LAST_UPDATED.WRITE_OFF_AMOUNT
}

const handleEnrollmentAmountChange = (event: InputEvent) => {
	const target = event.target as HTMLInputElement
	updateWriteOffAmount(target.value)
	form.value.lastUpdated = LAST_UPDATED.ENROLLMENT_AMOUNT
}

const handleSubmit = (e: Event) => {
	e?.preventDefault()

	formSchema
		.validate(form, { abortEarly: false })
		.then(() => {
			console.log('valid')
		})
		.catch((err) => {
			const validationErrors = err as ValidationError

			errors.value = validationErrors.inner.reduce(
				(acc, e) => {
					acc[e.path as keyof typeof acc] = e.message
					return acc
				},
				{ ...errors.value }
			)
		})
}

const updateEnrollmentAmount = (value = form.value.writeOffAmount) => {
	if (!rateStore.rate || !value || !form.value.from) {
		return
	}

	if (rateStore.rate.from.currency === form.value.from.currency) {
		form.value.enrollmentAmount = (Number(value) / rateStore.rate.from.amount).toString()
	} else {
		form.value.enrollmentAmount = (Number(value) * rateStore.rate.from.amount).toString()
	}
}

const updateWriteOffAmount = (value = form.value.enrollmentAmount) => {
	if (!rateStore.rate || !value || !form.value.to) {
		return
	}

	if (rateStore.rate.to.currency === form.value.to.currency) {
		form.value.writeOffAmount = (Number(value) * rateStore.rate.from.amount).toString()
	} else {
		form.value.writeOffAmount = (Number(value) / rateStore.rate.from.amount).toString()
	}
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
</script>

<template>
	<PageTemplate>
		<AppNavbar>
			<template #title>
				<h5>{{ $t('OWN.TITLE') }}</h5>
			</template>
		</AppNavbar>

		<form class="form" @submit="handleSubmit">
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
					:invalid="!!errors.writeOffAmount"
					:label="$t('OWN.FORM.WRITE_OFF_AMOUNT', { currency: $t(writeOffCurrency) })"
					:helper-text="errors.writeOffAmount ? $t(errors.writeOffAmount) : ''"
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
					:invalid="!!errors.amount"
					:label="$t('OWN.FORM.AMOUNT')"
					:helper-text="!!errors.amount ? $t(errors.amount) : $t('OWN.FORM.COMMISSION', rateHelperArgs)"
				/>
			</template>

			<Button id="ownSubmit" class="form__submit" type="primary" attr-type="submit">
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
}

.form__submit {
	margin-top: auto;
}
</style>
