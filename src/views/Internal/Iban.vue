<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from "vue-router";

import Guard from '@/components/Guard.vue';
import { Button, CurrencyInput, IbanInput, Input } from '@ui-kit/ui-kit';

import AccountDropdown from '@/components/AccountDropdown.vue';
import KnpDropdown from '@/components/KnpDropdown.vue';

import { useIbanStore } from '@/stores/iban.ts';
import { useLoadingStore } from '@/stores/loading';
import { useApplicationIDStore } from '@/stores/useApplicationIDStore';

import { getFIOByIban } from '@/services/iban.service';
import { handleTransferSSEResponse } from '@/services/sse.service';
import { TransferService } from '@/services/transfer.service';

import { Account, AccountsGroup, CURRENCY } from '@/types';
import { FORM_STATE } from '@/types/form';
import { IbanForm } from '@/types/iban';
import { Knp } from '@/types/knp';
import { TypeOfTransfer } from '@/types/transfer';

// import { validateInternalIban } from '@/helpers/internal-form-helper'

const IbanStore = useIbanStore()
const applicationIDStore = useApplicationIDStore()
const { setLoading } = useLoadingStore()
const router = useRouter()

IbanStore.clearErrors()

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

// Submit handler
const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()

	try {
		// await validateInternalIban(form.value)
		IbanStore.clearErrors()
		IbanStore.setState(FORM_STATE.LOADING)
		// isLeaveConfirmed = true
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
			const receiverName = response.name.RU;
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

		<Guard :form="form" />
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
