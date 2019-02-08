export const updateScript = (algo, key, updates) => {
    return {
        ...algo,
        [key]: {
            ...algo[key],
            ...updates
        }
    }
}