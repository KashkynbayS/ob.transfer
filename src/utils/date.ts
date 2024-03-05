import * as dayjs from 'dayjs';

import * as timezone from 'dayjs/plugin/timezone';

dayjs.extend(timezone)

const tz = "Asia/Oral"

export function formatDateTime(inputString: string | undefined): string {
    if (!inputString) {
        return ''
    }

    return dayjs(inputString).tz(tz).format('DD.MM.YYYY HH:mm')
}