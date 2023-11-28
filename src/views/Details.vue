<script setup lang="ts">
import AppNavbar from '@/components/AppNavbar.vue'
import ArrowRoundIcon from '@/assets/icons/arrow-round.svg'
import ShareIcon from '@/assets/icons/share.svg'
import { Button, Cell, CellGroup, CellGroupHeader } from '@ui-kit/ui-kit'
</script>

<template>
	<div class="details">
		<AppNavbar>
			<template #title><h5>Детали платежа</h5></template>
		</AppNavbar>

		<div class="details__value">-10 000 ₸</div>
		<div class="details__info">
			<span class="details__status">Исполнено</span>
			•
			<span class="details__date">16 октября 12:56</span>
		</div>

		<div class="details__actions">
			<Button id="share-details-btn">
				<ShareIcon style="width: auto; height: auto" />
				Поделиться
			</Button>
			<Button id="repeat-details-btn" type="secondary-gray">
				<ArrowRoundIcon />
				Повторить
			</Button>
		</div>

		<CellGroup type="island">
			<CellGroupHeader>
				<template #title>Детали списания</template>
			</CellGroupHeader>
			<Cell>
				<template #subtitle>Счет списания</template>
				<template #title>KZ34 5678 9012 3456 7892</template>
			</Cell>
			<Cell>
				<template #subtitle>Комиссия</template>
				<template #title>0 ₸</template>
			</Cell>
		</CellGroup>

		<CellGroup type="island">
			<CellGroupHeader>
				<template #title>Получатель</template>
			</CellGroupHeader>
			<Cell>
				<template #subtitle>Счет зачисления</template>
				<template #title>KZ34 5678 9012 3456 7892</template>
			</Cell>
			<Cell>
				<template #subtitle>Номер квитанции</template>
				<template #title>56789900</template>
			</Cell>
			<Cell>
				<template #subtitle>Имя получателя</template>
				<template #title>Ахметжанулы Сейтжан А.</template>
			</Cell>
		</CellGroup>
	</div>
</template>

<style scoped lang="scss">
.details {
	&__value {
		display: flex;
		flex-direction: column;
		font-size: var(--font-size-heading-1);
		font-weight: var(--font-weight-bold);
		line-height: var(--line-height-heading-1);
		padding: var(--space-4) var(--space-4) var(--space-1) var(--space-4);
	}

	&__info {
		padding: 0 var(--space-4);
		color: var(--text-low-contrast);
		margin-bottom: var(--space-6);
	}

	&__status {
		color: var(--text-high-contrast);
	}

	&__actions {
		display: flex;
		padding: 0 var(--space-4);
		gap: var(--space-4);
	}
}
</style>
