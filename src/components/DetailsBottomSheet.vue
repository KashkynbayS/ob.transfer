<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';

import { BottomSheet, Cell, CellGroup } from '@ui-kit/ui-kit';
import { ModalAction } from '@ui-kit/ui-kit/dist/ui/components/modal/types';


import { useTransferDetailsStore } from '@/stores/transferDetails.ts';
import { useApplicationIDStore } from '@/stores/useApplicationIDStore';

const transferDetailsStore = useTransferDetailsStore()
const applicationIDStore = useApplicationIDStore()

const conditions = computed(() => transferDetailsStore.conditions)

const bottomSheetRef = ref<InstanceType<typeof BottomSheet> | null>(null)

watch(
	() => transferDetailsStore.show,
	(newValue) => {
		if (newValue) {
			bottomSheetRef.value?.open()
		}
	}
)

const share = async () => {
	// TODO: Реализовать отправку PDF
	// const result = await getDepositRequisitesPdf({
	// 	accNumber: '0',
	// 	typeOfClientID: 1
	// })

	// if (result?.docURL) {
	// 	const fileBlob = await downloadFile(result?.docURL)
	// 	try {
	// 		if (navigator.share) {
	// 			const pdfFile = new File([fileBlob], 'Реквизиты депозита в KMF.pdf', { type: 'application/pdf' })

	// 			const shareData = {
	// 				files: [pdfFile]
	// 			}

	// 			await navigator.share(shareData)
	// 		} else {
	// 			console.log('Обмен не поддерживается')
	// 		}
	// 	} catch (error) {
	// 		console.error('Ошибка при отправке PDF:', error)
	// 	}
	// }
}


const actions = reactive<ModalAction[]>([
	{
		mode: 'primary',
		title: 'Поделиться',
		autoClose: false,
		action: share
	}
])
</script>

<template>
<BottomSheet ref="bottomSheetRef" :actions="actions" close-on-outline-click class="bottom-sheet"
	@closed="transferDetailsStore.closeBottomSheet()">
	<template #title>{{ $t('TRANSFER_DETAILS.TITLE') }}</template>

	<template #content>
		<CellGroup type="full" class="bottom-sheet__content">
			<Cell v-for="item in conditions" :key="item.key">
				<template #title>{{ $t(item.key) }}</template>
				<template #right>
					<span class="text-low-contrast" :class="{ success: item.status === true }">{{ $t(item.value)
						}}</span>
				</template>
			</Cell>
		</CellGroup>
	</template>
</BottomSheet>
</template>

<style scoped lang="scss">
.bottom-sheet__content {
	padding: 0;

	.success {
		color: var(--success-primary);
	}
}
</style>
