import { Transfer as TransferEvent } from "../generated/BITU/ERC20";
import { handleTokenHolderInTransferEvent, handleTokenInTransferEvent } from "./entities/token";

export function handleTransfer(event: TransferEvent): void {
  handleTokenInTransferEvent(event);
  handleTokenHolderInTransferEvent(event);
}
