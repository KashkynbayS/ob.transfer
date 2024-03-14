<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'

import { onBeforeRouteLeave, useRouter } from 'vue-router'

import { Button, CurrencyInput, IbanInput, Input, Modal } from '@ui-kit/ui-kit'
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types'

import AccountDropdown from '@/components/AccountDropdown.vue'
import KnpDropdown from '@/components/KnpDropdown.vue'

// import { addToFrequents } from '@/services/frequentService'

import { CURRENCY_SYMBOL } from '@/constants'

import { useIbanStore } from '@/stores/iban.ts'
import { useLoadingStore } from '@/stores/loading'
import { useStatusStore } from '@/stores/status'
import { useSuccessStore } from '@/stores/success'
import { useApplicationIDStore } from '@/stores/useApplicationIDStore'

import { getFIOByIban } from '@/services/iban.service'
import { handleTransferSSEResponse } from '@/services/sse.service'
import { TransferService } from '@/services/transfer.service'

import { Account, AccountsGroup, CURRENCY } from '@/types'
import { FORM_STATE } from '@/types/form'
import { IbanForm } from '@/types/iban'
import { Knp } from '@/types/knp'
import { TypeOfTransfer } from '@/types/transfer'

// import { validateInternalIban } from '@/helpers/internal-form-helper'

const IbanStore = useIbanStore()
const successStore = useSuccessStore()
const statusStore = useStatusStore()
const applicationIDStore = useApplicationIDStore()
const { setLoading } = useLoadingStore()

IbanStore.clearErrors()

// Modal
const modal = ref<InstanceType<typeof Modal> | null>(null)
const router = useRouter()
let destPath = ''
let isLeaveConfirmed = false

const actions = reactive<ModalAction[]>([
	{
		mode: 'primary',
		title: 'Перейти',
		autoClose: true,
		action: () => {
			isLeaveConfirmed = true
			router.push(destPath)
		}
	},
	{
		mode: 'ghost',
		title: 'Остаться',
		autoClose: true
	}
])

// Guard
onBeforeRouteLeave((to1, _, next) => {
	const { from, to, receiverName, amount } = form.value
	const isFormDirty = from || to || receiverName || amount
	destPath = to1.fullPath

	if (!isFormDirty || isLeaveConfirmed) {
		next(true)
	}

	modal.value?.open()
})

const form = ref<IbanForm>({
	from: undefined,
	to: '',
	receiverName: '',
	knp: null,
	paymentPurposes: '',
	amount: null,
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
	() => IbanStore.state,
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

// Submit handler
const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()

	try {
		// await validateInternalIban(form.value)
		IbanStore.clearErrors()
		IbanStore.setState(FORM_STATE.LOADING)
		isLeaveConfirmed = true
		setLoading(true)

		TransferService.initWithSSE(
			{
				iban: form.value.from!.iban,
				recIban: form.value.to,
				recFio: form.value.receiverName,
				amount: String(form.value.amount),
				typeOfTransfer: TypeOfTransfer.InternalIban,

				// paymentPurposes: form.value.paymentPurposes !== null ? form.value.paymentPurposes : undefined,
				// knp: form.value.knp !== null ? String(form.value.knp) : undefined
			},
			(event) => {
				// IbanStore.setState(FORM_STATE.SUCCESS)
				handleTransferSSEResponse(form.value, event, router)
				setLoading(false)
			}
		)
			.then((e) => {
				IbanStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
				// IbanStore.setState(FORM_STATE.SUCCESS)
				applicationIDStore.setApplicationID(e.applicationID)
			})
			.catch(() => {
				IbanStore.setState(FORM_STATE.ERROR)
			})

	} catch (err) {
		IbanStore.setState(FORM_STATE.INITIAL)
		IbanStore.setValidationError(err)
	}
}

const handleKnpUpdate = () => {
	IbanStore.clearErrors('knp')
}

const handleNameUpdate = async () => {
	form.value.receiverName = '';
	try {
		if (form.value.to.length === 20) {
			const response = await getFIOByIban.get(form.value.to.split(' ').join(''))
			const receiverName = `${response.firstname.RU} ${response.lastname.RU[0]}.`;
			form.value.receiverName = receiverName;
		}
	} catch (error) {
		console.error('Ошибка при получении данных о получателе:', error)
	}
}

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
})
</script>

<template>
	<div>
		<form class="internal-iban-form">
			<div class="internal-iban-form-top">
				<AccountDropdown v-model="form.from" :accounts-groups="accountsGroups" :label="$t('OWN.FORM.FROM')" />

				<IbanInput id="recieverNameModel" v-model:model-value="form.to" :label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
					:invalid="!!IbanStore.errors.to"
					:helper-text="IbanStore.errors.to ? $t(IbanStore.errors.to) : form.receiverName"
					@update:model-value="IbanStore.clearErrors('to')" @input="handleNameUpdate()" />

				<KnpDropdown v-if="form.to == 'KZ1111' && form.to !== null" id="knp" v-model="form.knp as Knp | null"
					:error-invalid="!!IbanStore.errors.knp"
					:helper-text="!!IbanStore.errors.knp ? $t(IbanStore.errors.knp) : ''" :update-field="handleKnpUpdate" />

				<Input v-if="form.to == 'KZ1111' && form.to !== null" id="paymentPurposes" v-model="form.paymentPurposes"
					:label="$t('EXTERNAL.FORM.PAYMENT_PURPOSES')" :invalid="!!IbanStore.errors.paymentPurposes"
					:helper-text="!!IbanStore.errors.paymentPurposes ? $t(IbanStore.errors.paymentPurposes) : ''"
					@update:model-value="IbanStore.clearErrors('paymentPurposes')" />

				<CurrencyInput id="amount" v-model:model-value="form.amount" :label="$t('INTERNAL.IBAN.FORM.SUM')"
					:invalid="!!IbanStore.errors.amount"
					:helper-text="IbanStore.errors.amount ? $t(IbanStore.errors.amount) : ''"
					@update:model-value="IbanStore.clearErrors('amount')" />
			</div>
			<div class="internal-iban-form-bottom">
				<Button id="internal-iban-submit" type="primary" @click="handleSubmit">
					{{ $t('INTERNAL.IBAN.FORM.SUBMIT') }}
				</Button>
			</div>
		</form>

		<Modal ref="modal" :actions="actions" close-on-outline-click>
			<template #title>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.TITLE') }}</template>

			<template #body>{{ $t('INTERNAL.MODAL.LEAVE_WHEN_FORM_IS_DIRTY.SUBTITLE') }}</template>
		</Modal>
	</div>
</template>

<style scoped lang="scss">
.internal-iban-form {
	box-sizing: content-box;
	padding: var(--space-3) var(--space-4) 0 var(--space-4);

	&-top {
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.internal-iban-form-bottom {
		position: absolute;
		bottom: var(--space-5);
		width: calc(100% - var(--space-4));

		Button {
			width: calc(100% - var(--space-4));
		}
	}
}
</style>
