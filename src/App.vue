<script setup lang="ts">
import { useLoadingStore } from './stores/loading'

const loadingStore = useLoadingStore()
</script>

<template>
	<main>
		<router-view></router-view>

		<transition name="fade" mode="out-in">
			<LoaderPage v-if="loadingStore.isLoading" />
		</transition>
	</main>
</template>

<style scoped></style>
