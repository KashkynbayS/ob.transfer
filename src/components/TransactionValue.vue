<script setup lang="ts">
import RejectedIcon from '@/assets/icons/rejected.svg';
import TimeIcon from '@/assets/icons/time.svg';

import { CURRENCY_SYMBOL } from '@/constants';
import { CURRENCY, HistoryItem } from '@/types';

defineProps<{
	transaction: HistoryItem
}>()

const mapIcon = (transaction: HistoryItem) => {
	switch (transaction.status) {
		case 'waiting':
		case 'in_progress':
			return TimeIcon;
		case 'rejected':
		case 'removed':
			return RejectedIcon;
		default:
			return null;
	}
}

</script>

<template>
	<span class="transaction-value" :class="transaction.status">
		<Component :is="mapIcon(transaction)" />
		<span>
			{{ transaction.amount }}
			{{ CURRENCY_SYMBOL[CURRENCY.KZT] }}
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
