import { describe, expect, it } from "vitest";
import { toProtobufNumber } from "./protobuf-numbers.ts";

describe("toProtobufNumber", () => {
  it("returns numbers as-is", () => {
    expect(toProtobufNumber(1_700_000_000)).toBe(1_700_000_000);
    expect(toProtobufNumber(0)).toBe(0);
  });

  it("reads protobufjs Long via toNumber()", () => {
    const longLike = { toNumber: () => 42 };
    expect(toProtobufNumber(longLike)).toBe(42);
  });

  it("reads Long-like objects with low bits", () => {
    expect(toProtobufNumber({ low: 99, high: 0 })).toBe(99);
  });

  it("returns 0 for nullish or unrecognized shapes", () => {
    expect(toProtobufNumber(null)).toBe(0);
    expect(toProtobufNumber(undefined)).toBe(0);
    expect(toProtobufNumber("nope")).toBe(0);
    expect(toProtobufNumber({})).toBe(0);
  });
});
