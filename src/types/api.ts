export interface BaseResponse<T = any> {
	success: true
	hostname?: string
	version?: string
	data: T
}

export interface BaseError {
	msg: string
	msgType: string
	success: false
}
