import { RewardsReceived } from "../generated/schema";
import { RewardsReceived as RewardsReceivedEvent } from "../generated/BitUStaking/BitUStaking";
import { Transfer as TransferEvent } from "../generated/BITU/ERC20";
import { formatUnits } from "./utils/formatUnits";
import { BIG_DECIMAL_ONE, BIG_INT_ZERO, ERC20_DECIMALS_NUMBER, SBITU_ADDRESS } from "./constants";
import { loadRewardTotal, loadToken } from "./utils/load";
import { handleTokenHolderInTransferEvent, handleTokenInTransferEvent } from "./entities/token";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function handleRewardsReceived(event: RewardsReceivedEvent): void {
  let entity = new RewardsReceived(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.amount = formatUnits(event.params.amount, ERC20_DECIMALS_NUMBER);
  entity.newVestingBITUAmount = formatUnits(event.params.newVestingBITUAmount, ERC20_DECIMALS_NUMBER);

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let rewardTotal = loadRewardTotal("BITU");
  const SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24);
  const mod = event.block.timestamp.minus(rewardTotal.lastTimestamp).mod(SECONDS_IN_DAY);
  const days = event.block.timestamp
    .minus(rewardTotal.lastTimestamp)
    .minus(mod)
    .plus(mod.isZero() ? BIG_INT_ZERO : SECONDS_IN_DAY)
    .div(SECONDS_IN_DAY);

  const token = loadToken(SBITU_ADDRESS);
  const dyr = entity.amount.div(token.totalSupply.times(days.toBigDecimal()));

  log.info("[RewardTotal] {} {} {}", [days.toString(), token.totalSupply.toString(), dyr.toString()]);

  rewardTotal.total = rewardTotal.total.plus(entity.amount);
  rewardTotal.lastAmount = entity.amount;
  rewardTotal.dyr = dyr;
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
