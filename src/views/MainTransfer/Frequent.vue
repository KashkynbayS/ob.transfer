<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Cell, CellGroup } from '@ui-kit/ui-kit';

import { useRouter } from 'vue-router';

import Transfers from '@ui-kit/kmf-icons/finance/transfers/transfers.svg';

const router = useRouter()

const frequents = ref<Array<{ amount: string, transferType: string, receiverName: string }>>([]);

onMounted(() => {
	const storedData = localStorage.getItem('frequents');
	frequents.value = storedData ? JSON.parse(storedData) : [];
});

const getTransferTypeText = (transferType: string): string => {
	switch (transferType) {
		case 'phone':
			return 'Перевод по номеру телефона';
		case 'iban':
			return 'Перевод по счету';
		case 'own':
			return 'Пополнение депозита/счета';
		default:
			return ''
	}
};

const redirectToInternalPhonePage = (item: any) => {
	const queryParams: Record<string, string> = {
		from: JSON.stringify(item.accountFrom),
		to: '',
		receiverName: item.receiverName,
		amount: item.amount,
	};

	switch (item.transferType) {
		case 'phone':
			queryParams.to = item.phoneNumber || '';
			router.push({
				name: 'InternalPhone',
				query: queryParams,
			});
		break;
		case 'iban':
			queryParams.to = item.accountTo || '';
			router.push({
				name: 'InternalAccount',
				query: queryParams,
			});
		break;
		case 'own':
			router.push({
				name: 'Own',
				query: queryParams,
			});
		break;
		default:
		break;
	}
};
</script>

<template>
	<CellGroup>
		<Cell
			v-for="item in frequents"
			:key="item.amount"
			left-type="img"
			:left-bg="'var(--bg-dark)'"
			:left-color="'var(--accent-primary)'"
			
			@click="redirectToInternalPhonePage(item)"
			>
				<template #left> <Transfers/> </template>
				<template #title> {{ item.receiverName }} </template>
				<template #subtitle>{{ getTransferTypeText(item.transferType) }}</template>
		</cell>
	</CellGroup>
</template>

<style scoped lang="scss"></style>
