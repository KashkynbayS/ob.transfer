<script setup lang="ts">
import { onMounted, ref } from 'vue'

import { Cell, CellGroup } from '@ui-kit/ui-kit'

import { getFrequents } from '@/services/frequent.service'

const frequents = ref<Array<{ amount: string; transferType: string; receiverName: string }>>([])

onMounted(async () => {
	try {
		const data = await getFrequents.fetch()
		frequents.value = data
		console.log('Данные об избранных переводах:', data)
	} catch (error) {
		console.error('Ошибка при получении избранных переводов:', error)
	}
})
</script>

<template>
	<CellGroup>
		<Cell
			v-for="item in frequents"
			:key="item.amount"
			left-type="img"
			:left-bg="'var(--bg-dark)'"
			:left-color="'var(--accent-primary)'"
		>
			<template #left> <Transfers /> </template>
			<template #title> {{ item.receiverName }} </template>
			<template #subtitle>{{ item.transferType }}</template>
		</Cell>
	</CellGroup>
</template>

<style scoped lang="scss"></style>
@/services/frequent.service
