import router from '@/router'
import { useLoadingStore } from '@/stores/loading.ts'
import { useStatusStore } from '@/stores/status.ts'
import { isLinkType, isStatusType, SseResponse } from '@/types'
import { getRelativeUrl } from '@/utils'
import { ref } from 'vue'

const { setLoading } = useLoadingStore()

export const initEventSource = (uuidValue: string) => {
	const eventSource = ref<EventSource | null>(null)

	if (eventSource.value) {
		eventSource.value.close()
	}

	eventSource.value = new EventSource('https://dev-api.kmf.kz/svc/go-redis-sse/events?stream=' + uuidValue)

	eventSource.value.onmessage = (event) => {
		setLoading(false)

		const eventData = JSON.parse(event.data) as SseResponse<'link' | 'status'>
		console.log('onmessage', eventData)

		if (isLinkType(eventData)) {
			if (eventData.data.target === '_blank') {
				window.open(eventData.data.url, '_blank')
			} else {
				const relativeUrl = getRelativeUrl(eventData.data.url)
				console.log('routing to ', relativeUrl)
				// noinspection JSIgnoredPromiseFromCall
				router.push(relativeUrl)
			}
		} else if (isStatusType(eventData)) {
			const statusStore = useStatusStore()

			statusStore.$state = eventData.data
			// noinspection JSIgnoredPromiseFromCall
			router.push({
				name: 'Status'
			})
		}
	}

	eventSource.value.onopen = (event) => {
		console.log('SSE is opened', event)
	}
}
