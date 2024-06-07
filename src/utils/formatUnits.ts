import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";

export function formatUnits(value: BigInt, decimals: BigInt): BigDecimal {
  return value.toBigDecimal().div(
    BigInt.fromI32(10)
      .pow(decimals.toI32() as u8)
      .toBigDecimal()
  );
}
