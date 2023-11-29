<script setup lang="ts">
import { useRouter } from 'vue-router'

import { Cell, CellGroup } from '@ui-kit/ui-kit'

import TransAnotherAccaunts from '@/assets/icons/transAnotherAccaunts.svg'
import TransBetweenMyAccaunts from '@/assets/icons/transBetweenMyAccaunts.svg'
import ArrowRightIcon from '@ui-kit/kmf-icons/arrows/large/arrowRight.svg'
import KMFSemifilled from '@ui-kit/kmf-icons/logos/kmf-semifilled.svg'

const router = useRouter()

const transferTypes = [
	{
		leftIcon: TransBetweenMyAccaunts,
		title: 'TRANSFER.OWN.TITLE',
		subTitle: 'TRANSFER.OWN.SUBTITLE',
		link: '/own'
	},
	{
		leftIcon: KMFSemifilled,
		title: 'TRANSFER.INTERNAL.TITLE',
		subTitle: 'TRANSFER.INTERNAL.SUBTITLE',
		link: '/internal'
	},
	{
		leftIcon: TransAnotherAccaunts,
		title: 'TRANSFER.OTHER.TITLE',
		subTitle: 'TRANSFER.OTHER.SUBTITLE',
		link: '/external'
	}
]
</script>

<template>
	<CellGroup class="transfer-types">
		<Cell
			v-for="item in transferTypes"
			:key="item.title"
			left-type="img"
			:left-bg="'var(--bg-dark)'"
			:left-color="'var(--accent-primary)'"
			@click="router.push(item.link)"
		>
			<template #left> <Component :is="item.leftIcon" /> </template>
			<template #title> {{ $t(item.title) }} </template>
			<template #subtitle>{{ $t(item.subTitle) }}</template>
			<template #right-button>
				<ArrowRightIcon />
			</template>
		</Cell>
	</CellGroup>
</template>

<style scoped lang="scss">
.transfer-types {
	margin: 0;
}
</style>
