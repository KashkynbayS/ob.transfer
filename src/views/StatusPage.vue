<script setup lang="ts">
import Error from '@/assets/images/error.svg'
import Info from '@/assets/images/info.svg'
import Success from '@/assets/images/success.png'
import StatusPageLayout from '@/layouts/StatusPageLayout.vue'
import { useStatusStore } from '@/stores/status.ts'
import { SseResponseStatusAction } from '@/types'
import { Button } from '@ui-kit/ui-kit'
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const statusStore = useStatusStore()

function handleClick(action: SseResponseStatusAction) {
	window.location.href = action.url
}

const image = computed(() => {
	switch (statusStore.class) {
		case 'success':
			return Success
		case 'error':
			return Error
		default:
			return Info
	}
})

onMounted(() => {
	if (statusStore.actions.length === 0) {
		router.replace('/')
	}
})
</script>

<template>
	<StatusPageLayout :image="image" :title="statusStore.title" title-width="80%" :text="statusStore.description">
		<template #footer>
			<Button
				v-for="action in statusStore.actions"
				id="status-action"
				:key="action.url"
				:type="action.type === 'secondary' ? 'ghost' : 'primary'"
				@click="handleClick(action)"
			>
				{{ action.title }}
			</Button>
		</template>
	</StatusPageLayout>
</template>
