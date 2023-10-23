import { FormParam } from '@/types'
import { useRoute } from 'vue-router'
import { ref } from 'vue'

export const useFormAutoFill = () => {
  const route = useRoute()

  function getParam(paramName: FormParam) {
    return route.query[paramName] as string | ''
  }

  const formData = ref({
    transferSum: getParam('transferSum'),
    accountFrom: getParam('accountFrom'),
    accountTo: getParam('accountTo'),
    recipientIban: getParam('recipientIban'),
    recipientIin: getParam('recipientIin'),
    recipientName: getParam('recipientName'),
    recipientPhone: getParam('recipientPhone'),
  })

  return {
    formData
  }
}
