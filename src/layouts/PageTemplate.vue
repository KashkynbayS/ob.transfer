<template>
	<div class="page-template">
		<slot name="header" />

		<div class="page-template__main">
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
	height: 100dvh;

	&__main {
		overflow-y: auto;
		overflow-x: hidden;
		width: 100%;
		flex-grow: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0 var(--space-4) 0 var(--space-4);
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
