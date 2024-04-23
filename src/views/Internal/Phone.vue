<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from "vue-router";

import { Button, CurrencyInput, InputBottomCard, SelectContactInput } from '@ui-kit/ui-kit';

import AccountDropdown from '@/components/AccountDropdown.vue';
import Guard from '@/components/Guard.vue';

import { useLeaveConfirmedStore } from '@/stores/guard';
import { useLoadingStore } from '@/stores/loading';
import { usePhoneStore } from '@/stores/phone.ts';
import { useApplicationIDStore } from '@/stores/useApplicationIDStore';

import { handleTransferSSEResponse } from '@/services/sse.service';
import { TransferService } from '@/services/transfer.service';

import { Account, AccountsGroup, CURRENCY } from '@/types';
import { FORM_STATE } from '@/types/form';
import { PhoneForm } from '@/types/phone';
import { TypeOfTransfer } from '@/types/transfer';

import { handleDataUpdate, handleSelectsUpdate, handleValidatePhone, toggleShowCard, validateInternalPhone } from '@/helpers/internal-form.helper';

const phoneStore = usePhoneStore()
const applicationIDStore = useApplicationIDStore()
const { setLoading } = useLoadingStore()
const leaveConfirmedStore = useLeaveConfirmedStore();

phoneStore.clearErrors()
const router = useRouter()

const form = ref<PhoneForm>({
	from: undefined,
	phoneNumber: '',
	receiverName: '',
	recIban: '',
	amount: null
})

const myAccounts = ref<Account[]>([])

const accountsGroups = computed<AccountsGroup[]>(() => [
	{
		id: 'my-accounts',
		title: 'ACCOUNTS_GROUPS.MY_ACCOUNTS',
		list: myAccounts.value
	}
])

const handleSubmit = async (e: Event | null = null) => {
	e?.preventDefault()

	try {
		await validateInternalPhone(form.value)
		phoneStore.clearErrors()
		phoneStore.setState(FORM_STATE.LOADING)
		setLoading(true)
		leaveConfirmedStore.setIsLeaveConfirmed(true);

		TransferService.initWithSSE(
			{
				iban: form.value.from!.iban,
				recIban: form.value.recIban,
				recMobileNumber: form.value.phoneNumber.split(' ').join(''),
				recFio: form.value.receiverName,
				amount: String(form.value.amount),
				typeOfTransfer: TypeOfTransfer.InternalPhone,
			},
			(event) => {
				handleTransferSSEResponse(form.value, event, router)
				setLoading(false)
			}
		)
			.then((e) => {
				phoneStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
				applicationIDStore.setApplicationID(e.applicationID)
			})
			.catch(() => {
				phoneStore.setState(FORM_STATE.ERROR)
			})
	} catch (err) {
		phoneStore.setState(FORM_STATE.INITIAL)
		phoneStore.setValidationError(err)
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
// _________________________________________
</script>

<template>
	<form class="internal-phone-form">
		<AccountDropdown id="from" v-model="form.from" :accounts-groups="accountsGroups" :label="$t('OWN.FORM.FROM')"
			:error-invalid="!!phoneStore.errors.from"
			:helper-text="!!phoneStore.errors.from ? $t(phoneStore.errors.from) : ''"
			:update-field="() => handleSelectsUpdate('from')" />

		<InputBottomCard :show="toggleShowCard(form)">
			<SelectContactInput v-model="form.phoneNumber" @input="handleDataUpdate(form)" @blur="handleValidatePhone(form)"
				:invalid="!!phoneStore.errors.phoneNumber"
				:helper-text="!!phoneStore.errors.phoneNumber ? $t(phoneStore.errors.phoneNumber) : ''"
				@update:model-value="phoneStore.clearErrors('phoneNumber')" />

			<template #title>
				<p class="inputCard-title"> {{ form.receiverName }} </p>
			</template>
		</InputBottomCard>

		<CurrencyInput id="123" :currency-value="form.amount" class="form-field" :label="$t('INTERNAL.PHONE.FORM.SUM')"
			:invalid="!!phoneStore.errors.amount"
			:helper-text="phoneStore.errors.amount ? $t(phoneStore.errors.amount) : ''"
			@onChange="(val) => { form.amount = val; phoneStore.clearErrors('amount') }" />
		<Button id="externalSubmit" class="form__submit" type="primary" @click="handleSubmit"> {{
			$t('INTERNAL.PHONE.FORM.SUBMIT') }} </Button>
	</form>

	<Guard :form="form" />
</template>

<style scoped lang="scss">
.internal-phone-form {
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