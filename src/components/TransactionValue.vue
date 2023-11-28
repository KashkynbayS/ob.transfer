<script setup lang="ts">
import { CURRENCY_SYMBOL, Transaction } from '@/types'
import TimeIcon from '@/assets/icons/time.svg'

defineProps<{
	transaction: Transaction
}>()
</script>

<template>
	<span class="transaction-value" :class="transaction.status">
		<TimeIcon v-if="transaction.status === 'waiting'" />
		{{ transaction.status === 'credited' ? '+' : transaction.status === 'removed' ? '-' : '' }}
		{{ transaction.value }}
		{{ CURRENCY_SYMBOL[transaction.currency] }}
	</span>
</template>

<style scoped lang="scss">
.transaction-value {
	&.credited {
		color: var(--text-green);
	}

	&.waiting {
		display: flex;
		align-items: center;
		color: #ffd500;
		gap: var(--space-1);
	}
}
</style>
