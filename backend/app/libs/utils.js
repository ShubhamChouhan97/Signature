export const generateMongooseDuplicateKeyMessage = (mongooseError) => {
    let message = Object.entries(mongooseError?.keyValue ?? {}).reduce((result, [key, value]) => {
        result += `Key: ${key} for value: ${JSON.stringify(value)} `
        return result;
    }, '');
    return `Error: Duplicate entries ${message}`;
}