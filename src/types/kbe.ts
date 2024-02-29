export interface Kbe {
	code: string
	id: string
	nameKz: string
	nameRu: string
	parent: string
}

export interface KbeApiResult {
	data: Kbe[]
	hostname: string
	success: boolean
	version: string
}
