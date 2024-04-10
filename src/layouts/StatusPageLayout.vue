<script setup lang="ts">
import { ref } from 'vue';

import { Cell, CellGroup, Switch } from '@ui-kit/ui-kit';

import { addToFavorites, removeFromFavorites } from '@/services/frequent.service';

import { useStatusStore } from '@/stores/status.ts';
import { useApplicationIDStore } from '@/stores/useApplicationIDStore';

import PageTemplate from '@/layouts/PageTemplate.vue';

import TransferDetailsBottomSheet from '@/components/DetailsBottomSheet.vue';

const applicationIDStore = useApplicationIDStore()
const statusStore = useStatusStore()

const props = withDefaults(
	defineProps<{
		title?: string
		titleWidth?: string
		text?: string
		textWidth?: string
		image?: string
		imageSize?: 'l' | 'm'
	}>(),
	{
		imageSize: 'm',
		textWidth: '100%',
		titleWidth: '100%'
	}
)

const cellSwitch = ref(false)

const formatter = new Intl.NumberFormat();

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
</script>

<template>
	<PageTemplate>
		<section class="content-body">
			<!-- <img :src="props.image" :alt="props.title" :class="props.imageSize" /> -->
			<!-- <h3>{{ props.title ? formatter.format(parseFloat(props.title)) : '' }}</h3> -->
			<h3>{{ typeof props.title === 'number' ? formatter.format(parseFloat(props.title)) : props.title }}</h3>

			<p class="text-low-contrast">{{ props.text }}</p>

			<CellGroup v-if="statusStore.class == 'success'" type="island" class="success__favourite">
				<Cell rightType="controls">
					<template #title> {{ $t('SUCCESS.ADD_TO_FAVOURITES') }} </template>

					<template #right>
						<Switch id="cell-switch" v-model="cellSwitch" :onUpdate:modelValue="handleAddToFavourites" />
					</template>
				</Cell>
			</CellGroup>
		</section>
		<template #footer>
			<slot name="footer" />
		</template>
	</PageTemplate>

	<TransferDetailsBottomSheet />
</template>

<style scoped lang="scss">
.content-body {
	flex-grow: 1;
	width: 100%;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	gap: var(--space-4);
}

img {
	height: auto;

	&.l {
		width: 232px;
	}

	&.m {
		width: 232px;
	}
}

h3 {
	font-size: var(--font-size-heading-3);
	text-align: center;
	max-width: v-bind(titleWidth);
}

p {
	max-width: v-bind(textWidth);
	text-align: center;
}

.success__favourite {
	width: 100%;
	padding: 0;
}
</style>
