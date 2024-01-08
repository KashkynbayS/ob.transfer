import { CURRENCY_SYMBOL } from '@/constants'
import { useStatusStore } from '@/stores/status'
import { CURRENCY, SseResponse, isLinkType, isStatusType } from '@/types'
import { getRelativeUrl } from '@/utils'
import { ref } from 'vue'
import { Router } from 'vue-router'

const SSE_URL = 'https://dev-api.kmf.kz/svc/go-redis-sse/events'

export const initEventSource = (uuidValue: string, callback: (event: MessageEvent<any>) => void) => {
	const eventSource = ref<EventSource | null>(null)

	if (eventSource.value) {
		eventSource.value.close()
	}

	eventSource.value = new EventSource(`${SSE_URL}?stream=${uuidValue}`)

	eventSource.value.onmessage = (event) => {
		callback(event)
	}

	eventSource.value.onopen = (event) => {
		console.log('SSE is opened', event)
	}
}

export const handleTransferSSEResponse = (
	form: Partial<{ amount: number | null | string; from: { currency: CURRENCY } }>,
	event: MessageEvent<any>,
	router: Router
) => {
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
		eventData.data.title = eventData.data.title
			.replace('{amount}', String(form.amount || 0))
			.replace('{currency}', form.from?.currency === CURRENCY.KZT ? CURRENCY_SYMBOL.kzt : CURRENCY_SYMBOL.usd)
		statusStore.$state = eventData.data
		// noinspection JSIgnoredPromiseFromCall
		console.log(eventData.data)
		router.push({
			name: 'Status'
		})
	}
}
