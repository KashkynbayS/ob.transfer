<script setup lang="ts">
import { useLoadingStore } from '@/stores/loading.ts';
import { useTargetBlankStore } from '@/stores/targetBlank.ts';
import { Modal } from '@ui-kit/ui-kit';
import { computed, ref, watch } from 'vue';

const targetBlankStore = useTargetBlankStore()
const loadingStore = useLoadingStore()

const url = computed(() => targetBlankStore.url)

const modal = ref<InstanceType<typeof Modal> | null>(null)

watch(url, (newUrl) => {
	console.log('set url', newUrl)
	if (newUrl) {
		// NOTE: disabled while we don't need for modal
		// modal.value?.open()
		window.open(urlForLink.value, '_blank')
		clickLinkHandler()
	} else {
		// modal.value?.close()
	}
})

const urlForLink = computed(() => {
	if (url.value.includes('http')) {
		return url.value
	} else {
		return `${location.origin}${import.meta.env.BASE_URL}/${url.value}`
	}
})

function clickLinkHandler() {
	targetBlankStore.setUrl('')
	loadingStore.setLoading(true)
}
</script>

<template>
	<Modal ref="modal" :actions="[]">
		<template #title>Подтверждение перехода на сторонний ресурс</template>
		<template #body>
			<p>Нажмите кнопку "Подтвердить" чтобы перейти на подписание</p>
			<a ref="noopener noreferrer" :href="urlForLink" target="_blank" class="button button--primary"
				@click="clickLinkHandler">
				Подтвердить
			</a>
		</template>
	</Modal>
</template>

<style scoped lang="scss">
p {
	margin-bottom: var(--space-4);
}
</style>
