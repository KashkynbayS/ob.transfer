<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'

import AppNavbar from '@/components/AppNavbar.vue'
import PageTemplate from '@/layouts/PageTemplate.vue'
import { checkOtp, resendOtp } from '@/services/otp.service'
import { useLoadingStore } from '@/stores/loading'
import { CheckOtpProps } from '@/types/otp'
import { OtpLayout } from '@ui-kit/ui-kit/dist/layouts'
import { useRoute } from 'vue-router'

const phone = ref('+77771234567')
const hasError = ref(false)
const timer = ref(10)
const code = ref('')

watchEffect(() => {
	const interval = setInterval(() => {
		if (timer.value > 0) {
			timer.value--
		}
	}, 1000)

	return () => clearInterval(interval)
})
type OtpType = 'agreement' | 'documents'

const typeMapping = {
	agreement: 'consent',
	documents: 'document'
}
const route = useRoute()
const maskedPhone = computed(() => formatPhoneNumber(phone.value))
const docType = computed(() => typeMapping[route.params.type as OtpType])
const uuid = sessionStorage.getItem('uuid')
const { setLoading } = useLoadingStore()

async function onCodeResend() {
	if (uuid) {
		try {
			const resultResend = await resendOtp({
				applicationID: uuid,
				docType: docType.value
			})

			if (resultResend?.otpSuccess) {
				timer.value = 60
				hasError.value = false
			}
		} catch (error) {
			console.error('Произошла ошибка при отправке OTP', error)
		}
	}
}
async function onCodeComplete(value: string) {
	if (uuid) {
		try {
			const props: CheckOtpProps = {
				applicationID: uuid,
				docType: docType.value,
				otp: Number(value)
			}

			if (route.query.subprocess === 'true') {
				props.subprocess = true
			}

			const checkResult = await checkOtp(props)

			if (!checkResult?.otpSuccess) {
				hasError.value = true
			} else {
				setLoading(true)
			}
		} catch (error) {
			console.error('Произошла ошибка при проверке OTP', error)
		}
	}
}

function formatPhoneNumber(number: string): string {
	const digits = number.replace(/\D/g, '')
	let withoutPlus = ''

	switch (digits.length) {
		case 10:
			break
		case 11:
			withoutPlus = digits.slice(1)
			break
		case 12:
			withoutPlus = digits.slice(2)
			break
		default:
			return number
	}

	return `+7 ${withoutPlus.slice(0, 3)} *** *${withoutPlus.slice(7, 8)} ${withoutPlus.slice(8, 10)}`
}
</script>

<template>
	<PageTemplate without-paddings>
		<OtpLayout
			v-model="code"
			lng="ru"
			class="opt__container"
			:timer-duration="10"
			@on-code-resend="onCodeResend"
			@on-complete="onCodeComplete"
		>
			<template #header>
				<AppNavbar />
			</template>
			<template #content>
				<h4>{{ $t('OTP.TITLE') }}</h4>
				<p class="text-low-contrast">{{ $t('OTP.CODE_SENT_TO_NUMBER') }} {{ maskedPhone }}</p>
			</template>
			<template #resend-btn-text> {{ $t('OTP.RECEIVE_NEW_CODE') }} </template>
		</OtpLayout>
	</PageTemplate>
</template>

<style scoped lang="scss">
.opt__container {
	width: 100%;
}
</style>
