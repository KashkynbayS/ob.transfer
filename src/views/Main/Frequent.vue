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
		case 5:
		case 6:
			return 'TRANSFER.FREQUENT.OWN';
		case 2:
		case 3:
		case 4:
			return recFio;
		default:
			return '';
	}
};

const getSubtitleByTransferType = (transferType: number): string => {
	switch (transferType) {
		case 1:
			return 'TRANSFER.FREQUENT.USD_CONVERTION';
		case 5:
			return 'TRANSFER.FREQUENT.DEPOSIT_REPLENISHMENT';
		case 6:
			return 'TRANSFER.FREQUENT.PARTIAL_WITHDRAWAL_FROM_DEPOSIT';
		case 2:
			return 'TRANSFER.FREQUENT.BY_PHONE';
		case 3:
			return 'TRANSFER.FREQUENT.BY_ACCOUNT_INTERNAL';
		case 4:
			return 'TRANSFER.FREQUENT.BY_ACCOUNT_EXTERNAL';
		default:
			return '';
	}
};

const removeFromFavoritesHandler = async (applicationID: string | undefined): Promise<void> => {
	if (applicationID) {
		try {
			await removeFromFavorites(applicationID);
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
	<Cell v-for="item in frequents" :key="item.amount" left-type="img" :left-bg="'var(--bg-dark)'"
		:left-color="'var(--accent-primary)'">
		<template #left>
			<Frequent />
		</template>
		<template #title> {{ $t(getReceiverNameByTransferType(item.typeOfTransfer, item.recFio || '')) }} </template>
		<template #subtitle><span class="text-caption">{{ $t(getSubtitleByTransferType(item.typeOfTransfer))
				}}</span></template>
		<template #right-button>
			<ResetIcon @click="removeFromFavoritesHandler(item.id)" width="20" height="20" />
		</template>
	</Cell>
</CellGroup>
</template>

<style scoped lang="scss"></style>
@/services/frequent.service
