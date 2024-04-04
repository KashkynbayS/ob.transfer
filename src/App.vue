<script setup lang="ts">
import TargetBlankModal from '@/components/TargetBlankModal.vue'
import { useLoadingStore } from '@/stores/loading.ts'
import { LoaderPage, HttpLogger } from '@ui-kit/ui-kit'
import { isDebug } from '@/utils'

const loadingStore = useLoadingStore()
</script>

<template>
	<main>
		<router-view v-slot="{ Component }">
			<transition name="slide-fade" mode="out-in">
				<component :is="Component" />
			</transition>
		</router-view>

		<transition name="fade" mode="out-in">
			<LoaderPage v-if="loadingStore.isLoading" />
		</transition>

		<transition name="fade" mode="out-in">
			<http-logger v-if="isDebug"></http-logger>
		</transition>

		<TargetBlankModal />
	</main>
</template>
