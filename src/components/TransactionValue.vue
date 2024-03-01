<script setup lang="ts">
import RejectedIcon from '@/assets/icons/rejected.svg';
import TimeIcon from '@/assets/icons/time.svg';

import { CURRENCY, HistoryItem } from '@/types';

import { useFormattedCurrency } from '@/hooks/useFormattedCurrency';

const props = defineProps<{
	transaction: HistoryItem
}>()

const formattedAmount = useFormattedCurrency(props.transaction.amount, CURRENCY.KZT).formattedCurrency

const mapIcon = (transaction: HistoryItem) => {
	switch (transaction.status) {
		case 'waiting':
		case 'in_progress':
			return TimeIcon;
		case 'rejected':
		case 'removed':
			return RejectedIcon;
		default:
			return '<span></span>';
	}
}

</script>

<template>
	<span class="transaction-value" :class="props.transaction.status">
		<Component :is="mapIcon(props.transaction)" />
		<span>
			{{ formattedAmount }}
		</span>
	</span>
</template>

<style scoped lang="scss">
.transaction-value {
	display: flex;
	gap: var(--space-1);
	align-items: center;

	&.removed,
	&.rejected {
		color: var(--text-error);
	}

	&.waiting,
	&.in_progress {
		color: #ffd500;
	}
}
</style>
