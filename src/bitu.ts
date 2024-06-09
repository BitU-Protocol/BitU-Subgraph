import { Transfer as TransferEvent } from "../generated/BITU/BITU";
import { handleTokenInTransferEvent } from "./entities/token";

export function handleTransfer(event: TransferEvent): void {
  handleTokenInTransferEvent(event);
}
