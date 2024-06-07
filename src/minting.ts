import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../generated/BitUMinting/BitUMinting";
import { CollateralToken, Mint, Redeem } from "../generated/schema";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { getOracle, getPrice, loadCollateralToken } from "./utils/token";
import { formatUnits } from "./utils/formatUnits";

export function handleMint(event: MintEvent): void {
  const entity = new Mint(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.minter = event.params.minter;
  entity.collateral_asset = event.params.collateral_asset;
  entity.collateral_amount = event.params.collateral_amount;
  entity.bitu_amount = event.params.bitu_amount;
  entity.collateral_ratio = event.params.collateral_ratio;
  entity.timestamp = event.params.timestamp;
  entity.mintfee = event.params.mintfee;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const collateralToken = loadCollateralToken(event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  const totalValueLocked = collateralToken.totalValueLocked.plus(
    formatUnits(event.params.collateral_amount, collateralToken.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price);

  const fees = collateralToken.fees.plus(formatUnits(event.params.mintfee, collateralToken.decimals));
  const feesUSD = fees.times(price);

  collateralToken.totalValueLocked = totalValueLocked;
  collateralToken.totalValueLockedUSD = totalValueLockedUSD;
  collateralToken.fees = fees;
  collateralToken.feesUSD = feesUSD;

  collateralToken.save();
}

export function handleRedeem(event: RedeemEvent): void {
  let entity = new Redeem(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.redeemer = event.params.redeemer;
  entity.collateral_asset = event.params.collateral_asset;
  entity.collateral_amount = event.params.collateral_amount;
  entity.bitu_amount = event.params.bitu_amount;
  entity.collateral_ratio = event.params.collateral_ratio;
  entity.interest = event.params.interest;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();
}
