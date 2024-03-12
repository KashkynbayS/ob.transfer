import useAxiosInstance from '@/api/api.instance.ts'
import { BaseResponse } from '@/types'
import { PhoneForm } from './../types/phone'

const { axiosInstance } = useAxiosInstance()

export const PhoneService = {
    transfer(form: PhoneForm): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(form)
                resolve()
            }, 1000)
        })
    }
}

export const getDataByPhone = {
    async get(phoneNumber: string): Promise<any> {
        try {
            const response = await axiosInstance.get<BaseResponse<any>>(`/main/recipients/by-phone/${encodeURIComponent(phoneNumber)}`);
            return response.data.data;

        } catch (error) {
            console.error('Ошибка при выполнении запроса:', error);
            throw error;
        }
    },
}
