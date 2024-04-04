import { BaseResponse } from '@/types'
import { CheckOtpProps, CheckOtpResponse, ResendOtpProps } from '@/types/otp'
import axiosInstance from '@/api/api.instance.ts'

// Запрос на проверку OTP
export async function checkOtp(props: CheckOtpProps): Promise<CheckOtpResponse | null> {
	try {
		const response = await axiosInstance.post<BaseResponse<CheckOtpResponse>>(`/fl/init/otp-check`, props)
		return response.data.data
	} catch (error) {
		console.error(error)
		return null
	}
}

// Запрос на переотправку OTP
export async function resendOtp(props: ResendOtpProps): Promise<CheckOtpResponse | undefined> {
	try {
		const response = await axiosInstance.post<BaseResponse<CheckOtpResponse>>(`/fl/init/otp-resend`, props)
		return response.data.data
	} catch (error) {
		console.error(error)
	}
}
