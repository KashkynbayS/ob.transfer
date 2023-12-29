type SseResponseType = 'link' | 'status'
type SseResponseTarget = '_blank' | '_self'
type SseResponseStatusClass = 'success' | 'error' | 'info'
type SseResponseStatusShowAs = 'modal' | 'fullpage'

export type SseResponseStatusAction = {
	title: string
	target: SseResponseTarget
	type: 'primary' | 'secondary'
	url: string
}

interface SseResponseLinkData {
	target: SseResponseTarget
	url: string
}

export interface SseResponseStatusData {
	class: SseResponseStatusClass
	title: string
	description: string
	showAs: SseResponseStatusShowAs
	actions: SseResponseStatusAction[]
}

export interface SseResponse<T extends SseResponseType> {
	type: T
	data: T extends 'link' ? SseResponseLinkData : SseResponseStatusData
}

export function isLinkType(data: SseResponse<'link' | 'status'>): data is SseResponse<'link'> {
	return data.type === 'link'
}

export function isStatusType(data: SseResponse<'link' | 'status'>): data is SseResponse<'status'> {
	return data.type === 'status'
}
