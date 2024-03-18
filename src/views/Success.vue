<script setup lang="ts">
import SuccessImage from '@/assets/images/success.svg'

import { Button, Cell, CellGroup, Switch } from '@ui-kit/ui-kit'

import TransferDetailsBottomSheet from '@/components/DetailsBottomSheet.vue'
import { CURRENCY_SYMBOL } from '@/constants'
import PageTemplate from '@/layouts/PageTemplate.vue'
import router from '@/router'
import { addToFavorites, removeFromFavorites } from '@/services/frequent.service'
import { useSuccessStore } from '@/stores/success'
import { useTransferDetailsStore } from '@/stores/transferDetails'
import { useApplicationIDStore } from '@/stores/useApplicationIDStore'
import { ref, watch } from 'vue'

const successStore = useSuccessStore()
const transferDetailsStore = useTransferDetailsStore()
const applicationIDStore = useApplicationIDStore()

const cellSwitch = ref(false)

const handleReturnToHome = () => {
	router.push('/')
}

const handleAddToFavourites = async (value: boolean) => {
	const applicationID = applicationIDStore.applicationID

	if (!applicationID) {
		return;
	}

	if (value) {
		await onAddToFavourites(applicationID)
	} else {
		await onRemoveFromFavourites(applicationID)
	}
}


const onAddToFavourites = async (applicationID: string) => {
	try {
		const addedItem = await addToFavorites(applicationID)
		console.log('Перевод успешно добавлен в избранное:', addedItem);
	} catch (error) {
		console.error('Ошибка при добавлении в избранное:', error);
	}
}

const onRemoveFromFavourites = async (applicationID: string) => {
	try {
		const itemToRemove = await removeFromFavorites(applicationID)
		console.log('Перевод успешно добавлен в избранное:', itemToRemove);
	} catch (error) {
		console.error('Ошибка при добавлении в избранное:', error);
	}
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
		<CellGroup type="island" class="success__favourite">
			<Cell rightType="controls">
				<template #title> {{ $t('SUCCESS.ADD_TO_FAVOURITES') }} </template>

				<template #right>
					<Switch id="cell-switch" v-model="cellSwitch" :onUpdate:modelValue="handleAddToFavourites" />
				</template>
			</Cell>
		</CellGroup>
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
	justify-content: center;
	align-items: center;
	gap: var(--space-4);
}

.success__favourite {
	width: 100%;
	padding: 0;
}

.success__image {
	/* margin: var(--space-20) auto var(--space-12); */
}
</style>
