
export const dateTransformer = {
    to: (data: Date | null) => {
        if(data === null){
            return null
        }
        const timestamp = data?.getTime()
        return Number.isNaN(timestamp) ? null: timestamp;
    },
    from: (value: string) => {
        if(value === null){
            return null
        }else{
            const date = new Date(+value)
            return date;
        }
    }
}