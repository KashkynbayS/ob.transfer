<script setup lang="ts">
const props = defineProps<{
	withoutPaddings?: boolean
}>()
</script>

<template>
	<div class="page-template">
		<div class="page-template__main" :class="{ 'page-template__main--no-paddings': props.withoutPaddings }">
			<slot />
		</div>
		<div class="page-template__footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<style scoped lang="scss">
.page-template {
	display: flex;
	flex-direction: column;
	height: 100vh;

	&__main {
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;

		&:not(.page-template__main--no-paddings) {
			padding: var(--space-18) var(--space-4) 0 var(--space-4);
		}
	}

	&__footer {
		background-color: var(--white);
		padding: var(--space-4);
		display: flex;
		flex-direction: column;
		gap: var(--space-3);
		width: 100%;
	}
}
</style>
