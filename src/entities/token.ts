import { Transfer as TransferEvent } from "../../generated/BITU/BITU";
import { formatUnits } from "../utils/formatUnits";
import { loadToken, loadTokenDayData, loadTokenHourData } from "../utils/load";
import { getTotalSupply } from "../utils/token";

export function handleTokenInTransferEvent(event: TransferEvent): void {
  const token = loadToken(event.address);
  const totalSupply = getTotalSupply(event.address);
  token.totalSupply = formatUnits(totalSupply, token.decimals);
  token.save();

  loadTokenHourData(event.block.timestamp, token, true);
  loadTokenDayData(event.block.timestamp, token, true);
}
