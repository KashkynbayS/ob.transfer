export function formatDateTime(inputString: string | undefined): string {
    if (!inputString) {
        return ''
    }

    const date = new Date(inputString);

    const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Aqtau',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    };

    return date.toLocaleString('ru-RU', options).replace(/\//g, '.');
}
