import { QueryParams } from '@/types'
import { useRoute, useRouter } from 'vue-router'

export const useQueryParams = () => {
  const route = useRoute()
  const router = useRouter()

  const queryParams = route.query as QueryParams

  async function goTo(routeName: string, queryProps: QueryParams) {
    await router.push({
      name: routeName,
      query: queryProps
    })
  }

  return {
    params: queryParams,
    goTo: goTo
  }
}
