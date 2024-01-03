<script setup lang="ts">
import PageTemplate from '@/layouts/PageTemplate.vue'

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
</script>

<template>
	<PageTemplate>
		<img :src="props.image" :alt="props.title" :class="props.imageSize" />
		<h3>{{ props.title }}</h3>
		<p class="text-low-contrast">{{ props.text }}</p>
		<template #footer>
			<slot name="footer" />
		</template>
	</PageTemplate>
</template>

<style scoped lang="scss">
img {
	height: auto;
	margin-bottom: var(--space-6);
	padding: 24px;
	margin-top: 72px;

	&.l {
		width: 343px;
	}

	&.m {
		width: 232px;
	}
}

h3 {
	margin-bottom: var(--space-4);
	text-align: center;
	max-width: v-bind(titleWidth);
}

p {
	flex-grow: 1;
	margin-bottom: var(--space-6);
	max-width: v-bind(textWidth);
	text-align: center;
}
</style>
