import { RewardsReceived } from "../generated/schema";
import { RewardsReceived as RewardsReceivedEvent } from "../generated/BitUStaking/BitUStaking";
import { Transfer as TransferEvent } from "../generated/BITU/ERC20";
import { formatUnits } from "./utils/formatUnits";
import { ERC20_DECIMALS_NUMBER } from "./constants";
import { loadReward } from "./utils/load";
import { handleTokenHolderInTransferEvent, handleTokenInTransferEvent } from "./entities/token";

export function handleRewardsReceived(event: RewardsReceivedEvent): void {
  let entity = new RewardsReceived(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.amount = formatUnits(event.params.amount, ERC20_DECIMALS_NUMBER);
  entity.newVestingBITUAmount = formatUnits(event.params.newVestingBITUAmount, ERC20_DECIMALS_NUMBER);

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let rewardTotal = loadReward("BITU");
  rewardTotal.total = rewardTotal.total.plus(entity.amount);
  rewardTotal.lastAmount = entity.amount;
  rewardTotal.lastNewVestingBITUAmount = entity.newVestingBITUAmount;
  rewardTotal.lastBlockNumber = event.block.number;
  rewardTotal.lastTimestamp = event.block.timestamp;
  rewardTotal.lastTransactionHash = event.transaction.hash;

  rewardTotal.save();
}

export function handleTransfer(event: TransferEvent): void {
  handleTokenInTransferEvent(event);
  handleTokenHolderInTransferEvent(event);
}
