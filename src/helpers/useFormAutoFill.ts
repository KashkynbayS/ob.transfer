import { FormParam, FormParams } from '@/types'
import { useRoute, useRouter } from 'vue-router'
import { ref } from 'vue'

export const useFormAutoFill = () => {
	const route = useRoute()
	const router = useRouter()

	function getParam(paramName: FormParam): string {
		return route.query[paramName] as string | ''
	}

	async function routerPushWithData(pageName: string, params: FormParams) {
		await router.push({ name: pageName, query: params })
	}

	const formData = ref<Record<FormParam, string>>({
		amount: getParam('amount'),
		iban: getParam('iban'),
		recIban: getParam('recIban'),
		recIin: getParam('recIin'),
		recFio: getParam('recFio'),
		recMobileNumber: getParam('recMobileNumber'),
		kbe: getParam('kbe')
	})

	return {
		formData,
		routerPushWithData
	}
}
