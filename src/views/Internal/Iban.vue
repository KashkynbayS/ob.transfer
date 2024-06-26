<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from "vue-router";

import Guard from '@/components/Guard.vue';
import { Button, CurrencyInput, IbanInput, Input, InputBottomCard } from '@ui-kit/ui-kit';

import AccountDropdown from '@/components/AccountDropdown.vue';
import KnpDropdown from '@/components/KnpDropdown.vue';

import { useLeaveConfirmedStore } from '@/stores/guard';
import { useIbanStore } from '@/stores/iban.ts';
import { useLoadingStore } from '@/stores/loading';
import { useApplicationIDStore } from '@/stores/useApplicationIDStore';

import { handleTransferSSEResponse } from '@/services/sse.service';
import { TransferService } from '@/services/transfer.service';

import { Account, AccountsGroup, CURRENCY } from '@/types';
import { FORM_STATE } from '@/types/form';
import { IbanForm } from '@/types/iban';
import { Knp } from '@/types/knp';
import { TypeOfTransfer } from '@/types/transfer';

import { handleKnpUpdate, handleNameUpdate, handleSelectsUpdate, toggleShowCard, validateInternalIban } from '@/helpers/internal-form-helper';

const IbanStore = useIbanStore()
const applicationIDStore = useApplicationIDStore()
const { setLoading } = useLoadingStore()
const router = useRouter()
const leaveConfirmedStore = useLeaveConfirmedStore();

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
		await validateInternalIban(form.value)
		IbanStore.clearErrors()
		IbanStore.setState(FORM_STATE.LOADING)
		setLoading(true)
		leaveConfirmedStore.setIsLeaveConfirmed(true);

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
	<form class="internal-iban-form">
		<AccountDropdown v-model="form.from" :accounts-groups="accountsGroups" :label="$t('OWN.FORM.FROM')"
			:error-invalid="!!IbanStore.errors.from" :helper-text="!!IbanStore.errors.from ? $t(IbanStore.errors.from) : ''"
			:update-field="() => handleSelectsUpdate('from')" />

		<InputBottomCard :show="toggleShowCard(form)">
			<IbanInput id="recieverNameModel" v-model="form.to" :label="$t('INTERNAL.IBAN.FORM.ACCOUNT_TO')"
				:invalid="!!IbanStore.errors.to" :helper-text="IbanStore.errors.to ? $t(IbanStore.errors.to) : ''"
				@update:model-value="IbanStore.clearErrors('to')" @input="handleNameUpdate(form);" />

			<template #title>
				<p class="inputCard-title"> {{ form.receiverName }} </p>
			</template>
		</InputBottomCard>

		<KnpDropdown v-if="form.to == 'KZ1111' && form.to !== null" id="knp" v-model="form.knp as Knp | null"
			:error-invalid="!!IbanStore.errors.knp" :helper-text="!!IbanStore.errors.knp ? $t(IbanStore.errors.knp) : ''"
			:update-field="handleKnpUpdate" />

		<Input v-if="form.to == 'KZ1111' && form.to !== null" id="paymentPurposes" v-model="form.paymentPurposes"
			:label="$t('EXTERNAL.FORM.PAYMENT_PURPOSES')" :invalid="!!IbanStore.errors.paymentPurposes"
			:helper-text="!!IbanStore.errors.paymentPurposes ? $t(IbanStore.errors.paymentPurposes) : ''"
			@update:model-value="IbanStore.clearErrors('paymentPurposes')" />

		<CurrencyInput id="amount" :currency-value="form.amount" :label="$t('INTERNAL.IBAN.FORM.SUM')"
			:invalid="!!IbanStore.errors.amount" :helper-text="IbanStore.errors.amount ? $t(IbanStore.errors.amount) : ''"
			@onChange="(val) => { form.amount = val; IbanStore.clearErrors('amount') }" />

		<Button id="externalSubmit" class="form__submit" type="primary" @click="handleSubmit">
			{{ $t('INTERNAL.IBAN.FORM.SUBMIT') }}
		</Button>
	</form>

	<Guard :form="form" />
</template>

<style scoped lang="scss">
.internal-iban-form {
	width: 100%;
	height: 100%;
	flex-direction: column;
	display: flex;
	gap: var(--space-3);
	padding: var(--space-3) 0 var(--space-4) 0;

	.inputCard-title {
		color: var(--text-white);
	}

	.form__submit {
		margin-top: auto;
	}
}
</style>
