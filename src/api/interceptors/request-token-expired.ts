
import { InternalAxiosRequestConfig } from "axios"
import { jwtDecode } from "jwt-decode"

import { tokenExpired } from "@ui-kit/events"

import { useAlertsStore } from "@/stores"
import { AlertType } from "@/types"

const EXPIRED_ALERT: AlertType = {
    show: true,
    title: 'Внимание',
    description: 'Ваша сессия истекла. Пожалуйста, авторизуйтесь снова',
    actions: [
        {
            mode: 'primary',
            title: 'Авторизоваться',
            autoClose: false,
            disabled: false,
            action: () => tokenExpired()
        }
    ]
}

const showExpiredAlert = (config: InternalAxiosRequestConfig<any>) => {
    const alertStore = useAlertsStore()
    const abortController = new AbortController()

    config.signal = abortController.signal

    abortController.abort()
    alertStore.showErrorAlert(EXPIRED_ALERT)
}

export const requestTokenExpiredInterceptor = (
    config: InternalAxiosRequestConfig<any>
) => {
    if (!sessionStorage.accessToken) {
        showExpiredAlert(config)
    }

    try {
        const decoded = jwtDecode(sessionStorage.accessToken) as any
        if (Date.now() > decoded.exp * 1000) {
            showExpiredAlert(config)
        }
    } catch {
        showExpiredAlert(config)
    }

    return config
}

