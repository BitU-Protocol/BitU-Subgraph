import { RewardsReceived } from "../generated/schema";
import { RewardsReceived as RewardsReceivedEvent } from "../generated/BitUStaking/BitUStaking";
import { Transfer as TransferEvent } from "../generated/BITU/ERC20";
import { formatUnits } from "./utils/formatUnits";
import { BIG_INT_ZERO, ERC20_DECIMALS_NUMBER } from "./constants";
import { loadRewardTotal } from "./utils/load";
import { handleTokenHolderInTransferEvent, handleTokenInTransferEvent } from "./entities/token";
import { BigInt, log } from "@graphprotocol/graph-ts";
import { getTotalAssets } from "./utils/staking";
import { safeDiv } from "./utils/safeDiv";

export function handleRewardsReceived(event: RewardsReceivedEvent): void {
  let entity = new RewardsReceived(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.amount = formatUnits(event.params.amount, ERC20_DECIMALS_NUMBER);
  entity.newVestingBITUAmount = formatUnits(event.params.newVestingBITUAmount, ERC20_DECIMALS_NUMBER);

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  let rewardTotal = loadRewardTotal("BITU");
  const totalAssets = getTotalAssets();
  const SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24);
  const formattedCurrentTimestamp = event.block.timestamp.minus(event.block.timestamp.mod(SECONDS_IN_DAY));
  const formattedLastTimestamp = rewardTotal.lastTimestamp.minus(rewardTotal.lastTimestamp.mod(SECONDS_IN_DAY));
  const formattedPreviousDateTimestamp = rewardTotal.previousDateTimestamp.minus(
    rewardTotal.previousDateTimestamp.mod(SECONDS_IN_DAY)
  );

  if (formattedCurrentTimestamp.equals(formattedLastTimestamp)) {
    const currentTotal = rewardTotal.total.plus(entity.amount);
    const days = formattedCurrentTimestamp.minus(formattedPreviousDateTimestamp).div(SECONDS_IN_DAY);

    const dyr = safeDiv(currentTotal.minus(rewardTotal.previousDateTotal), totalAssets.times(days.toBigDecimal()));

    log.info(
      "[equals] formattedCurrentTimestamp {} {}, formattedLastTimestamp {} {}, formattedPreviousDateTimestamp {} {}, days {}, dyr {}, TotalAssets {}",
      [
        event.block.timestamp.toString(),
        formattedCurrentTimestamp.toString(),
        rewardTotal.lastTimestamp.toString(),
        formattedLastTimestamp.toString(),
        rewardTotal.previousDateTimestamp.toString(),
        formattedPreviousDateTimestamp.toString(),
        days.toString(),
        dyr.toString(),
        totalAssets.toString(),
      ]
    );

    rewardTotal.total = currentTotal;
    rewardTotal.lastAmount = entity.amount;
    rewardTotal.dyr = dyr;
    rewardTotal.lastNewVestingBITUAmount = entity.newVestingBITUAmount;
    rewardTotal.lastBlockNumber = event.block.number;
    rewardTotal.lastTimestamp = event.block.timestamp;
    rewardTotal.lastTransactionHash = event.transaction.hash;
  } else {
    const currentTotal = rewardTotal.total.plus(entity.amount);
    const days = formattedCurrentTimestamp.minus(formattedLastTimestamp).div(SECONDS_IN_DAY);

    const dyr = safeDiv(entity.amount, totalAssets.times(days.toBigDecimal()));

    log.info(
      "[equals] formattedCurrentTimestamp {} {}, formattedLastTimestamp {} {}, formattedPreviousDateTimestamp {} {}, days {}, dyr {}, TotalAssets {}",
      [
        event.block.timestamp.toString(),
        formattedCurrentTimestamp.toString(),
        rewardTotal.lastTimestamp.toString(),
        formattedLastTimestamp.toString(),
        rewardTotal.previousDateTimestamp.toString(),
        formattedPreviousDateTimestamp.toString(),
        days.toString(),
        dyr.toString(),
        totalAssets.toString(),
      ]
    );

    rewardTotal.previousDateTotal = rewardTotal.total;
    rewardTotal.previousDateTimestamp = rewardTotal.lastTimestamp;

    rewardTotal.total = currentTotal;
    rewardTotal.lastAmount = entity.amount;
    rewardTotal.dyr = dyr;
    rewardTotal.lastNewVestingBITUAmount = entity.newVestingBITUAmount;
    rewardTotal.lastBlockNumber = event.block.number;
    rewardTotal.lastTimestamp = event.block.timestamp;
    rewardTotal.lastTransactionHash = event.transaction.hash;
  }

  rewardTotal.save();
}

export function handleTransfer(event: TransferEvent): void {
  handleTokenInTransferEvent(event);
  handleTokenHolderInTransferEvent(event);
}
