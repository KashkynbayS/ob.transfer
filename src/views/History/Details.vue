<script setup lang="ts">
import { Button, Cell, CellGroup, CellGroupHeader } from '@ui-kit/ui-kit';
// import { format } from 'date-fns';
// import { ru } from 'date-fns/locale';
import { DateTime } from 'luxon';
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import AppNavbar from '@/components/AppNavbar.vue';
import { useFormAutoFill } from '@/helpers/useFormAutoFill.ts';
import { useHistoryStore } from '@/stores/history.ts';
import { FormParams, TransactionStatus } from '@/types';

import ArrowRoundIcon from '@/assets/icons/arrow-round.svg';
import ShareIcon from '@/assets/icons/share.svg';

const route = useRoute()
const historyStore = useHistoryStore()
const { routerPushWithData } = useFormAutoFill()

const transactionId = computed(() => route.params.id as string)
const details = computed(() => historyStore.getTransactionById(transactionId.value))

const statuses: Record<TransactionStatus, string> = {
	success: 'HISTORY.STATUS.COMPLETED',
	in_progress: 'HISTORY.STATUS.IN_PROCESSING',
	waiting: 'HISTORY.STATUS.WAITING',
	credited: 'HISTORY.STATUS.CREDITED',
	removed: 'HISTORY.STATUS.REMOVED',
	rejected: 'HISTORY.STATUS.REJECTED'
}

const formattedDateTime = computed(
	() => {
		if (!details.value) {
			return '';
		}

		const date = DateTime.fromISO(details.value.createdAt).setZone('Asia/Aqtau');
		return date.setLocale('ru').toFormat('d MMMM HH:mm');;
	}
)

function formatIban(input: string): string {
	if (input.length !== 20) {
		return input
	}

	return input.match(/.{1,4}/g)?.join(' ') || '';
}

function repeatAction() {
	const params: FormParams = {}

	if (details.value?.amount) params.amount = String(details.value.amount)
	if (details.value?.recMobileNumber) params.recMobileNumber = details.value.recMobileNumber
	if (details.value?.recIban) params.recIban = details.value.recIban
	if (details.value?.recIin) params.recIin = details.value.recIin
	if (details.value?.recFio) params.recFio = details.value.recFio
	if (details.value?.iban) params.iban = details.value.iban
	if (details.value?.kbe) params.kbe = details.value.kbe

	routerPushWithData('External', params)
}

onMounted(() => {
	historyStore.fetchHistory()
})
</script>

<template>
	<div class="details">
		<AppNavbar>
			<template #title>
				<h5>{{ $t('HISTORY.DETAILS.TITLE') }}</h5>
			</template>
		</AppNavbar>

		<template v-if="details">
			<div class="details__value">-{{ details.amount }} ₸</div>
			<div class="details__info">
				<span class="details__status">{{ $t(statuses[details.status]) }}</span>
				•
				<span class="details__date">{{ formattedDateTime }}</span>
			</div>

			<div class="details__actions">
				<Button id="share-details-btn">
					<ShareIcon style="width: auto; height: auto" />
					{{ $t('HISTORY.DETAILS.SHARE') }}
				</Button>
				<Button id="repeat-details-btn" type="secondary-gray" @click="repeatAction">
					<ArrowRoundIcon color="var(--text-low-contrast)" />
					<span class="text-low-contrast">{{ $t('HISTORY.DETAILS.REPEAT') }}</span>
				</Button>
			</div>

			<CellGroup type="island">
				<CellGroupHeader>
					<template #title>{{ $t('HISTORY.DETAILS.WRITE_OFF_DETAILS') }}</template>
				</CellGroupHeader>
				<Cell>

					<template #subtitle>{{ $t('HISTORY.DETAILS.WRITE_OFF_ACCOUNT') }}</template>

					<template #title>{{ details.iban ? formatIban(details.iban) : '' }}</template>
				</Cell>
				<Cell>

					<template #subtitle>{{ $t('HISTORY.DETAILS.COMMISSION') }}</template>

					<template #title>{{ details.commission || 0 }} ₸</template>
				</Cell>
			</CellGroup>

			<CellGroup type="island">
				<CellGroupHeader>

					<template #title>{{ $t('HISTORY.DETAILS.RECEIVER') }}</template>
				</CellGroupHeader>
				<Cell v-if="details.recIban">

					<template #subtitle>{{ $t('HISTORY.DETAILS.ACCOUNT_ENROLLMENT') }}</template>

					<template #title>{{ formatIban(details.recIban) }}</template>
				</Cell>
				<Cell v-if="details.knp">

					<template #subtitle>{{ $t('HISTORY.DETAILS.KNP') }}</template>

					<template #title>{{ details.knp }}</template>
				</Cell>
				<Cell v-if="details.receiptNumber">

					<template #subtitle>{{ $t('HISTORY.DETAILS.RECEIPT_NUMBER') }}</template>

					<template #title>{{ details.receiptNumber }}</template>
				</Cell>
				<Cell v-if="details.recIin">

					<template #subtitle>{{ $t('HISTORY.DETAILS.RECEIVER_IIN') }}</template>

					<template #title>{{ details.recIin }}</template>
				</Cell>
				<Cell v-if="details.recMobileNumber">

					<template #subtitle>{{ $t('HISTORY.DETAILS.RECEIVER_PHONE') }}</template>

					<template #title>+{{ details.recMobileNumber }}</template>
				</Cell>
				<Cell v-if="details.recFio">

					<template #subtitle>{{ $t('HISTORY.DETAILS.RECEIVER_NAME') }}</template>

					<template #title>{{ details.recFio }}</template>
				</Cell>
			</CellGroup>
		</template>
	</div>
</template>

<style scoped lang="scss">
.details {
	&__value {
		display: flex;
		flex-direction: column;
		font-size: var(--font-size-heading-1);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-heading-1);
		padding: var(--space-4) var(--space-4) var(--space-1) var(--space-4);
	}

	&__info {
		padding: 0 var(--space-4);
		color: var(--text-low-contrast);
		margin-bottom: var(--space-6);
	}

	&__status {
		color: var(--text-high-contrast);
	}

	&__actions {
		display: flex;
		padding: 0 var(--space-4);
		gap: var(--space-4);
	}
}
</style>
