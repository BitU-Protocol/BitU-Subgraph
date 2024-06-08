import { BigDecimal } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_ZERO } from "../constants";

export function safeDiv(amount0: BigDecimal, amount1: BigDecimal): BigDecimal {
  if (amount1.equals(BIG_DECIMAL_ZERO)) {
    return BIG_DECIMAL_ZERO;
  } else {
    return amount0.div(amount1);
  }
}
