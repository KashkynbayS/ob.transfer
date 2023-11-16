<script setup lang="ts">
import { Cell, CellGroup } from '@ui-kit/ui-kit';

import { useRouter } from 'vue-router';

import Transfers from '@ui-kit/kmf-icons/finance/transfers/transfers.svg';

const router = useRouter()

const frequents = [
	{
		leftIcon: Transfers,
		title: 'Ахметжанулы Сейтжан',
		subTitle: 'Перевод по счету',
		link: ''
	},
	{
		leftIcon: Transfers,
		title: 'Мирас Р.',
		subTitle: 'Перевод по номеру телефона',
		link: ''
	},
	{
		leftIcon: Transfers,
		title: 'Между своими счетами',
		subTitle: 'Покупка USD',
		link: ''
	},
	{
		leftIcon: Transfers,
		title: 'Между своими счетами',
		subTitle: 'Пополнение депозита',
		link: ''
	}
]
</script>

<template>
	<CellGroup>
		<cell 
			left-type="img" 
			:left-bg="'var(--bg-dark)'" 
			:left-color="'var(--accent-primary)'"
			
			v-for="item in frequents" 
			:key="item.title" 
			@click="router.push(item.link)"
			>
				<template #left> <Component :is="item.leftIcon" /> </template>
				<template #title> {{ item.title }} </template>
				<template #subtitle>{{ item.subTitle }}</template>
		</cell>
	</CellGroup>
</template>

<style scoped lang="scss">
</style>
