import { type Hex, keccak256, toHex } from "viem";
import stringify from "json-stringify-deterministic";

export async function deterministicKeccakHash<T>(obj: T): Promise<Hex> {
  const deterministicString = stringify(obj);
  return keccak256(toHex(deterministicString));
}
