export function formatDateTime(inputString: string | undefined): string {
    if (!inputString) {
        return '';
    }

    const date = new Date(inputString);

    const day = new Intl.DateTimeFormat('ru-RU', { day: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(date);
    const time = new Intl.DateTimeFormat('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
    }).format(date);

    return `${day} ${month} ${time}`;
}
