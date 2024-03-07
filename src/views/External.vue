<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'

import { Button, CurrencyInput, IbanInput, Input } from '@ui-kit/ui-kit'

import PageTemplate from '@/layouts/PageTemplate.vue'

import AccountDropdown from '@/components/AccountDropdown.vue'
import AppNavbar from '@/components/AppNavbar.vue'
import KbeDropdown from '@/components/KbeDropdown.vue'
import KnpDropdown from '@/components/KnpDropdown.vue'


import { CURRENCY_SYMBOL } from '@/constants'

import { useFormAutoFill } from '@/helpers/useFormAutoFill.ts'
import router from '@/router'
import { getFioByIin } from '@/services/external.service.ts'
import { handleTransferSSEResponse } from '@/services/sse.service'
import { TransferService } from '@/services/transfer.service'

import { useExternalStore } from '@/stores/external'
import { useStatusStore } from '@/stores/status'
import { useSuccessStore } from '@/stores/success'
import { useApplicationIDStore } from '@/stores/useApplicationIDStore'

import { Account, AccountsGroup, CURRENCY } from '@/types'
import { ExternalForm } from '@/types/external'
import { FORM_STATE } from '@/types/form'
import { Kbe } from '@/types/kbe'
import { Knp } from '@/types/knp'
import { TypeOfTransfer } from '@/types/transfer'

const externalStore = useExternalStore()
const successStore = useSuccessStore()
const statusStore = useStatusStore()
const { formData } = useFormAutoFill()
const applicationIDStore = useApplicationIDStore()

externalStore.clearErrors()

// Mock for UL
const form = ref<ExternalForm>({
	from: undefined,
	iban: formData.value?.recIban || 'KZ86601A871003328701',
	kbe: null,
	knp: null,
	iin: formData.value?.recIin || '910503300507',
	receiverName: formData.value?.recFio || '',
	amount: Number(formData.value?.amount) || null,
	paymentPurposes: formData.value?.paymentPurposes || '019'
})

const myAccounts = ref<Account[]>([])

const accountsGroups = computed<AccountsGroup[]>(() => [
	{
		id: 'my-accounts',
		title: 'ACCOUNTS_GROUPS.MY_ACCOUNTS',
		list: myAccounts.value
	}
])

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
				router.push('/Success')
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

const handleSubmit = (e: Event | null = null) => {
	e?.preventDefault()

	externalStore.clearErrors()
	externalStore.setState(FORM_STATE.LOADING)

	externalStore.validate(form.value).then(() => {
		const mapped: any = {

			iban: "KZ84888AB22040000174",
			recIban: "KZ86601A871003328701",
			recIin: "910503300507",
			amount: String(form.value.amount),
			typeOfTransfer: TypeOfTransfer.External,
			kbe: '19',
			recFio: form.value.receiverName,

			// recIin: form.value.iin,
			// knp: form.value.knp,
			// recBin: '871209301136',
			// recCompany: 'ТОО "АБВГД"',
			// bin_hardcode: '180541000305',
			// recFio: form.value.receiverName,
			// kbe: String(Number(form.value.knp?.code)),
			// transferDescription: 'отмывание денег',
		}

		TransferService.initWithSSE(mapped, (event) => {
			externalStore.setState(FORM_STATE.SUCCESS)
			handleTransferSSEResponse(mapped, event, router)
		})
			.then((e) => {
				externalStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
				externalStore.setState(FORM_STATE.SUCCESS)
				applicationIDStore.setApplicationID(e.applicationID)
			})
			.catch(() => {
				externalStore.setState(FORM_STATE.ERROR)
			})
	})
}

const handleKbeUpdate = () => {
	externalStore.clearErrors('kbe')
}

const handleKnpUpdate = () => {
	externalStore.clearErrors('knp')
}

const handleIINUpdate = async () => {
	try {
		if (form.value.iin.length === 12) {
			const response = await getFioByIin.post(form.value.iin);
			const { full_name: receiverName } = response;
			form.value.receiverName = receiverName;
		}
	} catch (error) {
		console.error('Ошибка при выполнении запроса:', error);
	}
};

onMounted(async () => {
	const deals = await TransferService.fetchDealsList()

	myAccounts.value = deals.accounts.map((account) => ({
		id: account.id,
		currency: account.currency.name.toLowerCase() as CURRENCY,
		iban: account.accNumber,
		title: `ACCOUNTS_GROUPS.ACCOUNT_${account.currency.name.toUpperCase()}`,
		amount: account.amount
	}))
})
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
			<AccountDropdown id="from" v-model="form.from" :accounts-groups="accountsGroups"
				:label="$t('EXTERNAL.FORM.FROM')" />
			<IbanInput id="iban" v-model="form.iban" :label="$t('EXTERNAL.FORM.IBAN')"
				:invalid="!!externalStore.errors.iban"
				:helper-text="!!externalStore.errors.iban ? $t(externalStore.errors.iban) : ''"
				@update:model-value="externalStore.clearErrors('iban')" />
			<Input id="iin" v-model="form.iin" :label="$t('EXTERNAL.FORM.IIN')" :invalid="!!externalStore.errors.iin"
				:helper-text="!!externalStore.errors.iin ? $t(externalStore.errors.iin) : form.receiverName"
				@update:model-value="externalStore.clearErrors('iin')" @input="handleIINUpdate" />
			<KbeDropdown id="kbe" v-model="form.kbe as Kbe | null" :error-invalid="!!externalStore.errors.kbe"
				:helper-text="!!externalStore.errors.kbe ? $t(externalStore.errors.kbe) : ''"
				:update-field="handleKbeUpdate" />
			<KnpDropdown id="knp" v-model="form.knp as Knp | null" :error-invalid="!!externalStore.errors.knp"
				:helper-text="!!externalStore.errors.knp ? $t(externalStore.errors.knp) : ''"
				:update-field="handleKnpUpdate" />
			<Input id="name" v-model="form.paymentPurposes" :label="$t('EXTERNAL.FORM.PAYMENT_PURPOSES')"
				:invalid="!!externalStore.errors.paymentPurposes"
				:helper-text="!!externalStore.errors.paymentPurposes ? $t(externalStore.errors.paymentPurposes) : ''"
				@update:model-value="externalStore.clearErrors('paymentPurposes')" />
			<CurrencyInput id="amount" v-model="form.amount" :label="$t('EXTERNAL.FORM.AMOUNT')"
				:invalid="!!externalStore.errors.amount"
				:helper-text="!!externalStore.errors.amount ? $t(externalStore.errors.amount) : ''"
				@update:model-value="externalStore.clearErrors('amount')" />

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
	padding: var(--space-4) 0;
}

.form__submit {
	margin-top: auto;
}
</style>
