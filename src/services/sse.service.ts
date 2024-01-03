import { ref } from 'vue'

export const initEventSource = (uuidValue: string, callback: (event: MessageEvent<any>) => void) => {
	const eventSource = ref<EventSource | null>(null)

	if (eventSource.value) {
		eventSource.value.close()
	}

	eventSource.value = new EventSource('https://dev-api.kmf.kz/svc/go-redis-sse/events?stream=' + uuidValue)

	eventSource.value.onmessage = (event) => {
		callback(event)
	}

	eventSource.value.onopen = (event) => {
		console.log('SSE is opened', event)
	}
}
