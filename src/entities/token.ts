import { log } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent } from "../../generated/BITU/BITU";
import { loadToken, loadTokenDayData, loadTokenHourData } from "../utils/load";
import { ADDRESS_ZERO } from "../constants";
import { formatUnits } from "../utils/formatUnits";

export function handleTokenInTransferEvent(event: TransferEvent): void {
  const token = loadToken(event.address);

  if (event.params.from.equals(ADDRESS_ZERO)) {
    token.totalSupply = token.totalSupply.plus(formatUnits(event.params.value, token.decimals));
  }

  if (event.params.to.equals(ADDRESS_ZERO)) {
    token.totalSupply = token.totalSupply.minus(formatUnits(event.params.value, token.decimals));
  }
  token.save();

  loadTokenHourData(event.block.timestamp, token, true);
  loadTokenDayData(event.block.timestamp, token, true);
}
