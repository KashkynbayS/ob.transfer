<script setup lang="ts">
import { onMounted, ref } from 'vue';

import { Cell, CellGroup } from '@ui-kit/ui-kit';

import { getFrequents, removeFromFavorites } from '@/services/frequent.service';

import { ITransferRequest } from '@/types/transfer';

import Frequent from '@/assets/icons/frequent.svg';
import ResetIcon from '@ui-kit/kmf-icons/interface/delete/delete-trash-semifilled.svg';

const frequents = ref<Array<ITransferRequest>>([]);

const getReceiverNameByTransferType = (transferType: number, recFio: string): string => {
	switch (transferType) {
		case 1:
			return 'Между своими счетами';
		case 2:
			return recFio;
		case 3:
			return 'В другой банк РК';
		default:
			return '';
	}
};

const getSubtitleByTransferType = (transferType: number): string => {
	switch (transferType) {
		case 1:
			return 'Пополнение депозита';
		case 2:
			return 'Перевод по счету';
		case 3:
			return 'В другой банк РК';
		default:
			return '';
	}
};

const removeFromFavoritesHandler = async (applicationID: string | undefined): Promise<void> => {
	if (applicationID) {
		try {
			await removeFromFavorites.delete(applicationID);
			frequents.value = frequents.value.filter(item => item.id !== applicationID);
		} catch (error) {
			console.error('Ошибка при удалении из избранного:', error);
		}
	}
};

onMounted(async () => {
	try {
		const response = await getFrequents.fetch()
		frequents.value = response.data
		console.log('Данные об избранных переводах:', response.data)
	} catch (error) {
		console.error('Ошибка при получении избранных переводов:', error)
	}
})
</script>

<template>
	<CellGroup>
		<Cell reverse
			v-for="item in frequents"
			:key="item.amount"
			left-type="img"
			:left-bg="'var(--bg-dark)'"
			:left-color="'var(--accent-primary)'"
		>
			<template #left><Frequent/></template>
			<template #title> {{ getReceiverNameByTransferType(item.typeOfTransfer, item.recFio || '')  }} </template>
			<template #subtitle>{{ getSubtitleByTransferType(item.typeOfTransfer) }}</template>
			<template #right-button>
				<ResetIcon @click="removeFromFavoritesHandler(item.id)" width="20" height="20" />
			</template>
		</Cell>
	</CellGroup>
</template>

<style scoped lang="scss"></style>
@/services/frequent.service
