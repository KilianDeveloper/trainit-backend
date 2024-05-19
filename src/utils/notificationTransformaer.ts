export const notificationArrayTransformer = {
    to: (data: Notification[]) => JSON.stringify(data),
    from: (value: string) => JSON.parse(value) as Notification[]
}