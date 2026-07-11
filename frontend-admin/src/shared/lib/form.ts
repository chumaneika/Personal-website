export function nullableText(value: string) {
  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : null;
}

export function optionalNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}
