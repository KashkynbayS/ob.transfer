<script setup lang="ts">
import SuccessImage from '@/assets/images/success.svg'

import { Button } from '@ui-kit/ui-kit'

import TransferDetailsBottomSheet from '@/components/DetailsBottomSheet.vue'
import { CURRENCY_SYMBOL } from '@/constants'
import PageTemplate from '@/layouts/PageTemplate.vue'
import router from '@/router'
import { useSuccessStore } from '@/stores/success'
import { useTransferDetailsStore } from '@/stores/transferDetails'
import { watch } from 'vue'

const successStore = useSuccessStore()
const transferDetailsStore = useTransferDetailsStore()

const handleReturnToHome = () => {
	router.push('/')
}

watch(
	() => successStore,
	(store) => {
		console.log(store)
	}
)
</script>

<template>
	<PageTemplate>
		<section class="success">
			<SuccessImage class="success__image" />
			<h2>{{ successStore.amount }} {{ CURRENCY_SYMBOL[successStore.currency] }}</h2>
			<p class="text-low-contrast">{{ $t('SUCCESS.TITLE') }}</p>
		</section>

		<template #footer>
			<Button id="ownSubmit" type="ghost" @click="transferDetailsStore.openBottomSheet()">
				{{ $t('SUCCESS.DETAILS') }}
			</Button>
			<Button id="ownSubmit" type="primary" @click="handleReturnToHome()">
				{{ $t('SUCCESS.RETURN_TO_HOMEPAGE') }}
			</Button>
		</template>

		<TransferDetailsBottomSheet />
	</PageTemplate>
</template>

<style scoped>
.success {
	flex-grow: 1;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: var(--space-4);
}

.success__image {
	margin: var(--space-20) auto var(--space-12);
}
</style>
