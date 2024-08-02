import { log } from "@graphprotocol/graph-ts";
import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../../generated/BitUMinting/BitUMinting";
import { ERC20_DECIMALS_NUMBER } from "../constants";
import { formatUnits } from "../utils/formatUnits";
import { loadCollateralAsset, loadRedeem, loadRedeemDayData } from "../utils/load";
import { getOracle, getPrice } from "../utils/oracle";
import { safeDiv } from "../utils/safeDiv";

export function handleCollateralAssetInMintEvent(event: MintEvent): void {
  const collateralAsset = loadCollateralAsset(event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  log.info("[MintEvent] {} {}", [collateralAsset.symbol, price.toString()]);

  const totalValueLocked = collateralAsset.totalValueLocked.plus(
    formatUnits(event.params.collateral_amount, collateralAsset.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price);

  const fees = collateralAsset.fees.plus(formatUnits(event.params.mintfee, collateralAsset.decimals));
  const feesUSD = fees.times(price);

  const bituMinted = collateralAsset.bituMinted.plus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  collateralAsset.totalValueLocked = totalValueLocked;
  collateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  collateralAsset.fees = fees;
  collateralAsset.feesUSD = feesUSD;
  collateralAsset.bituMinted = bituMinted;
  collateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, bituMinted);

  collateralAsset.save();
}

export function handleCollateralAssetInRedeemEvent(event: RedeemEvent): void {
  const collateralAsset = loadCollateralAsset(event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  log.info("[RedeemEvent] {} {}", [collateralAsset.symbol, price.toString()]);

  const totalValueLocked = collateralAsset.totalValueLocked.minus(
    formatUnits(event.params.collateral_amount, collateralAsset.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price);

  const bituMinted = collateralAsset.bituMinted.minus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  collateralAsset.totalValueLocked = totalValueLocked;
  collateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  collateralAsset.bituMinted = bituMinted;
  collateralAsset.bituBurned = collateralAsset.bituBurned.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );
  collateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, bituMinted);

  collateralAsset.save();
}

export function handleCollateralAssetInLiqiudationEvent(event: LiqiudationEvent): void {
  const collateralAsset = loadCollateralAsset(event.params.asset);

  const oracle = getOracle(event.params.asset);

  const price = getPrice(oracle);

  log.info("[LiqiudationEvent] {} {}", [collateralAsset.symbol, price.toString()]);

  const currentAssetLiquidated = formatUnits(event.params.collateral_amount, collateralAsset.decimals);
  const assetLiquidatedUSD = collateralAsset.assetLiquidatedUSD.plus(currentAssetLiquidated.times(price));

  const totalValueLocked = collateralAsset.totalValueLocked.minus(currentAssetLiquidated);

  const totalValueLockedUSD = totalValueLocked.times(price);

  collateralAsset.totalValueLocked = totalValueLocked;
  collateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  collateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, collateralAsset.bituMinted);
  collateralAsset.assetLiquidated = collateralAsset.assetLiquidated.plus(currentAssetLiquidated);
  collateralAsset.assetLiquidatedUSD = assetLiquidatedUSD;
  collateralAsset.bituLiquidated = collateralAsset.bituLiquidated.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );

  collateralAsset.save();
}

export function handleRedeemStatistics(event: RedeemEvent): void {
  const redeemDayData = loadRedeemDayData(event.block.timestamp, event.params.collateral_asset);

  const redeem = loadRedeem(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
    event.params.collateral_asset,
    redeemDayData.id
  );
  redeem.redeemer = event.params.redeemer;
  redeem.collateral_amount = formatUnits(event.params.collateral_amount, ERC20_DECIMALS_NUMBER);
  redeem.bitu_amount = formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER);
  redeem.collateral_ratio = event.params.collateral_ratio;
  redeem.interest = formatUnits(event.params.interest, ERC20_DECIMALS_NUMBER);
  redeem.timestamp = event.params.timestamp;
  redeem.blockNumber = event.block.number;
  redeem.blockTimestamp = event.block.timestamp;
  redeem.transactionHash = event.transaction.hash;

  redeemDayData.collateral_amount = redeemDayData.bitu_amount.plus(
    formatUnits(event.params.collateral_amount, ERC20_DECIMALS_NUMBER)
  );
  redeemDayData.bitu_amount = redeemDayData.bitu_amount.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );

  redeem.dayData = redeemDayData.id;
  redeem.save();
  redeemDayData.save();
}
