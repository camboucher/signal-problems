/**
 * GTFS-RT uses protobuf int64 for Unix times; protobufjs may surface Long or number.
 */
export function toProtobufNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (value && typeof (value as { toNumber: () => number }).toNumber === "function")
    return (value as { toNumber: () => number }).toNumber();
  if (value && typeof (value as { low: number }).low === "number")
    return (value as { low: number }).low;
  return 0;
}
