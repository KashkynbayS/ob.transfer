export interface Knp {
	code: string
	id: string
	nameKz: string
	nameRu: string
}

export interface KnpApiResult {
	data: Knp[]
	hostname: string
	success: boolean
	version: string
}
