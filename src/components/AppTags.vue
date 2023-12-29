<script setup lang="ts">
import { Tag } from '@/types/history'

import CloseIcon from '@ui-kit/kmf-icons/interface/close/close-medium.svg'

const props = defineProps<{
	tags: Tag[]
}>()

const emit = defineEmits<{
	(e: 'removed', v: string): void
}>()

function closeHandler(value: string) {
	emit('removed', value)
}
</script>

<template>
	<div class="app-tags">
		<div v-for="tag in props.tags" :key="tag.value" class="app-tags__item">
			<span>{{ tag.title }}</span>
			<CloseIcon class="app-tags__close" @click="closeHandler(tag.value)" />
		</div>
	</div>
</template>

<style scoped lang="scss">
.app-tags {
	display: flex;
	gap: var(--space-3);
	overflow-x: auto;

	// Скрытие скроллбара
	-ms-overflow-style: none;
	scrollbar-width: none;
	&::-webkit-scrollbar {
		display: none;
	}

	&__item {
		height: var(--space-10);
		padding: 0 var(--space-3);
		display: flex;
		flex-wrap: nowrap;
		white-space: nowrap;
		align-items: center;
		gap: var(--space-2);
		border-radius: var(--border-radius-s);
		background-color: var(--bg-dark);
	}

	&__close {
		color: var(--text-low-contrast);
		cursor: pointer;
	}
}
</style>
