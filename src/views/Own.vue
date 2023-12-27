<script setup lang="ts">
import { computed, ref, watch, watchEffect } from 'vue'

import { useRouter } from 'vue-router'

import { Button, CurrencyInput } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AccountDropdown from '@/components/AccountDropdown.vue'
import AppNavbar from '@/components/AppNavbar.vue'

import { ACCOUNTS_GROUPS } from '@/mocks/own'

import { CURRENCY_SYMBOL } from '@/constants'
import { LAST_UPDATED, OwnForm } from '@/types'

import { useOwnStore } from '@/stores/own.ts'
import { useRateStore } from '@/stores/rate.ts'

const router = useRouter()

import { initEventSource } from '@/services/transfer.service'
import { FORM_STATE } from '@/types/form'
import { extractCurrencyFromAmount } from '@/utils/currencies'

const ownStore = useOwnStore()
const rateStore = useRateStore()

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

const hasDifferentCurrencies = computed(() => {
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

const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()
	ownStore.validate(form.value)

	try {
		//FIXME i guess this is no longer actual ? if no, please uncomment line below
		// await addToFrequents(form.value)
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
		console.log(state, '-------')
		switch (state) {
			case FORM_STATE.SUCCESS:
				initEventSource(ownStore.applicationId, console.log)

				// successStore.setDetails(Number(form.value.amount), form.value.from?.currency || CURRENCY.KZT, [
				// 	{ name: 'Сумма списания', value: '100 $' },
				// 	{ name: 'Статус', value: 'Исполнено', colored: true },
				// 	{ name: 'Номер квитанции', value: '56789900' },
				// 	{ name: 'Счет списания', value: 'KZ****4893' },
				// 	{ name: 'Счет зачисления', value: 'KZ****4893' },
				// 	{ name: 'Дата', value: '11.04.2023' }
				// ])
				// router.push('Success')
				break

			case FORM_STATE.ERROR:
				router.push('Error')
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

// onMounted(() => {
// 	const queryParams = router.currentRoute.value.query

// 	form.value.amount = (queryParams.amount as string) || ''
// })
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
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('OWN.FORM.FROM')"
				:disabled="form.to"
				:error-invalid="!!ownStore.errors.from"
				:helper-text="!!ownStore.errors.from ? $t(ownStore.errors.from) : ''"
				:update-field="() => handleSelectsUpdate('from')"
			/>
			<AccountDropdown
				id="to"
				v-model="form.to"
				:accounts-groups="ACCOUNTS_GROUPS"
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

			{{ form }}

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
}

.form__submit {
	margin-top: auto;
}
</style>
