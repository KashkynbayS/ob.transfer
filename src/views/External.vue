<script setup lang="ts">
import { ref, watch } from 'vue'

import { Button, CurrencyInput, IbanInput, Input } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AccountDropdown from '@/components/AccountDropdown.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import KnpDropdown from '@/components/KnpDropdown.vue'

import { ACCOUNTS_GROUPS } from '@/mocks/internal'

import { CURRENCY_SYMBOL } from '@/constants'
import router from '@/router'
import { useExternalStore } from '@/stores/external'
import { useSuccessStore } from '@/stores/success'
import { CURRENCY } from '@/types'
import { ExternalForm } from '@/types/external'
import { FORM_STATE } from '@/types/form'

const externalStore = useExternalStore()
const successStore = useSuccessStore()

externalStore.clearErrors()

const form = ref<ExternalForm>({
	from: undefined,
	iban: '',
	knp: null,
	iin: '',
	receiverName: '',
	amount: null
})

watch(
	() => externalStore.state,
	(state) => {
		const currency = form.value.from ? form.value.from?.currency : CURRENCY.KZT

		switch (state) {
			case FORM_STATE.SUCCESS:
				successStore.setDetails(Number(form.value.amount), currency, [
					{ name: 'Сумма списания', value: `${form.value.amount} ${CURRENCY_SYMBOL[currency]}` },
					{ name: 'Статус', value: 'Исполнено', colored: true },
					{ name: 'Номер квитанции', value: '56789900' },
					{ name: 'Счет списания', value: 'KZ****4893' },
					{ name: 'Счет зачисления', value: 'KZ****4893' },
					{ name: 'Дата', value: '11.04.2023' }
				])
				router.push('Success')
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

const handleSubmit = (e: Event | null = null) => {
	e?.preventDefault()
	externalStore.validateAndSubmit(form.value)
}

const handleKnpUpdate = () => {
  externalStore.clearErrors('knp');
};
</script>

<template>
	<PageTemplate>
		<template #header>
			<AppNavbar>
				<template #title>
					<h5>{{ $t('EXTERNAL.TITLE') }}</h5>
				</template>
			</AppNavbar>
		</template>
		<form class="form" @submit="handleSubmit">
			<AccountDropdown
				id="from"
				v-model="form.from"
				:accounts-groups="ACCOUNTS_GROUPS"
				:label="$t('EXTERNAL.FORM.FROM')"
			/>
			<IbanInput 
				id="iban" 
				v-model="form.iban" 
				:label="$t('EXTERNAL.FORM.IBAN')" 
				:invalid="!!externalStore.errors.iban"
				:helper-text="!!externalStore.errors.iban ? $t(externalStore.errors.iban) : ''"
				@update:model-value="externalStore.clearErrors('iban')"
			/>
			<KnpDropdown 
				id="knp" 
				v-model="form.knp" 
				:errorInvalid="!!externalStore.errors.knp"
				:helperText="!!externalStore.errors.knp ? $t(externalStore.errors.knp) : ''"
				:updateField="handleKnpUpdate"
			/>
			<Input 
			id="iin" 
			v-model="form.iin" 
				:label="$t('EXTERNAL.FORM.IIN')" 
				:invalid="!!externalStore.errors.iin"
				:helper-text="!!externalStore.errors.iin ? $t(externalStore.errors.iin) : ''"
				@update:model-value="externalStore.clearErrors('iin')"
			/>
			<Input 
				id="name" 
				v-model="form.receiverName"
				:label="$t('EXTERNAL.FORM.NAME')"
				:invalid="!!externalStore.errors.receiverName"
				:helper-text="!!externalStore.errors.receiverName ? $t(externalStore.errors.receiverName) : ''"
				@update:model-value="externalStore.clearErrors('receiverName')"	
			/>
			<CurrencyInput
				id="amount"
				v-model="form.amount"
				:label="$t('EXTERNAL.FORM.AMOUNT')"
				:invalid="!!externalStore.errors.amount"
				:helper-text="!!externalStore.errors.amount ? $t(externalStore.errors.amount) : ''"
				@update:model-value="externalStore.clearErrors('amount')"
			/>

			<Button id="externalSubmit" class="form__submit" type="primary" attr-type="submit" @click="handleSubmit">
				{{ $t('EXTERNAL.SUBMIT') }}
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
