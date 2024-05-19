export const checkProperties = (value: any, schema: object) => {
    for (const i in value) {
        if (!schema.hasOwnProperty(i)) {
            throw new Error("Invalid property " + i);
        }
    }
    return true;
}