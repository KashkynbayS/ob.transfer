<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from "vue-router";

import { Button, CurrencyInput } from '@ui-kit/ui-kit';
import { SelectContactInput } from '@ui-kit/ui-kit/dist/widgets';

import AccountDropdown from '@/components/AccountDropdown.vue';
import Guard from '@/components/Guard.vue';

import { useLoadingStore } from '@/stores/loading';
import { usePhoneStore } from '@/stores/phone.ts';
import { useApplicationIDStore } from '@/stores/useApplicationIDStore';

import { getDataByPhone } from '@/services/phone.service';
import { handleTransferSSEResponse } from '@/services/sse.service';
import { TransferService } from '@/services/transfer.service';

import { Account, AccountsGroup, CURRENCY } from '@/types';
import { FORM_STATE } from '@/types/form';
import { PhoneForm } from '@/types/phone';
import { TypeOfTransfer } from '@/types/transfer';

import { validateInternalPhone } from '@/helpers/internal-form.helper';

const phoneStore = usePhoneStore()
const applicationIDStore = useApplicationIDStore()
const { setLoading } = useLoadingStore()

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
	// handleIINUpdate()
	try {
		await validateInternalPhone(form.value)
		phoneStore.clearErrors()
		phoneStore.setState(FORM_STATE.LOADING)
		setLoading(true)
		// isLeaveConfirmed = true

		TransferService.initWithSSE(
			{
				// iban: myAccounts.value[0]?.iban,
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
				// phoneStore.setState(FORM_STATE.SUCCESS)
			}
		)
			.then((e) => {
				phoneStore.applicationId = e.applicationID
				sessionStorage.setItem('uuid', e.applicationID)
				// phoneStore.setState(FORM_STATE.SUCCESS)
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

const handleDataUpdate = async () => {
	form.value.receiverName = '';
	try {
		if (form.value.phoneNumber.length === 16) {
			const response = await getDataByPhone.get(form.value.phoneNumber.split(' ').join(''))
			const receiverName = response.name.RU;
			const recIban = response.iban;
			form.value.receiverName = receiverName;
			form.value.recIban = recIban;
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
// _________________________________________
</script>

<template>
	<div>
		<form class="internal-phone-form">
			<div class="internal-phone-form-top">
				<AccountDropdown id="from" v-model="form.from" :accounts-groups="accountsGroups"
					:label="$t('OWN.FORM.FROM')" />

				<SelectContactInput v-model="form.phoneNumber" @input="handleDataUpdate()"
					:helperText="form.receiverName" />

				<CurrencyInput id="123" v-model="form.amount" class="form-field" :label="$t('INTERNAL.PHONE.FORM.SUM')"
					:invalid="!!phoneStore.errors.amount"
					:helper-text="phoneStore.errors.amount ? $t(phoneStore.errors.amount) : ''"
					@update:model-value="phoneStore.clearErrors('amount')" />
			</div>
			<div class="internal-phone-form-bottom">
				<Button id="123" type="primary" @click="handleSubmit"> {{ $t('INTERNAL.PHONE.FORM.SUBMIT') }} </Button>
			</div>
		</form>

		<Guard :form="form" />
	</div>
</template>

<style scoped lang="scss">
.internal-phone-form {
	box-sizing: content-box;
	padding: var(--space-3) var(--space-4) 0 var(--space-4);

	&-top {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
	}

	.internal-phone-form-bottom {
		position: absolute;
		bottom: var(--space-5);
		width: calc(100% - var(--space-4));

		Button {
			width: calc(100% - var(--space-4));
		}
	}
}
</style>
