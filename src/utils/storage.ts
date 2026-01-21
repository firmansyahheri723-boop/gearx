export function createDeserializer<T>(defaultValue: T) {
	return (value: string | null): T => {
		if (!value) return defaultValue;
		try {
			return JSON.parse(value) as T;
		} catch {
			return defaultValue;
		}
	};
}
