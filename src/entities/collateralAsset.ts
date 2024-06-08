import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../../generated/BitUMinting/BitUMinting";
import { ERC20_DECIMALS_NUMBER } from "../constants";
import { formatUnits } from "../utils/formatUnits";
import { loadCollateralAsset, loadCollateralAssetDayData, loadCollateralAssetHourData } from "../utils/load";
import { getOracle, getPrice } from "../utils/oracle";
import { safeDiv } from "../utils/safeDiv";

export function handleCollateralAssetInMintEvent(event: MintEvent): void {
  const collateralAsset = loadCollateralAsset(event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  const totalValueLocked = collateralAsset.totalValueLocked.plus(
    formatUnits(event.params.collateral_amount, collateralAsset.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price).plus(collateralAsset.liquidatedUSD);

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

  loadCollateralAssetHourData(event.block.timestamp, collateralAsset, true);
  loadCollateralAssetDayData(event.block.timestamp, collateralAsset, true);
}

export function handleCollateralAssetInRedeemEvent(event: RedeemEvent): void {
  const collateralAsset = loadCollateralAsset(event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  const totalValueLocked = collateralAsset.totalValueLocked.minus(
    formatUnits(event.params.collateral_amount, collateralAsset.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price).plus(collateralAsset.liquidatedUSD);

  const bituMinted = collateralAsset.bituMinted.minus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  collateralAsset.totalValueLocked = totalValueLocked;
  collateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  collateralAsset.bituMinted = bituMinted;
  collateralAsset.bituBurned = collateralAsset.bituBurned.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );
  collateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, bituMinted);

  collateralAsset.save();

  loadCollateralAssetHourData(event.block.timestamp, collateralAsset, true);
  loadCollateralAssetDayData(event.block.timestamp, collateralAsset, true);
}

export function handleCollateralAssetInLiqiudationEvent(event: LiqiudationEvent): void {
  const collateralAsset = loadCollateralAsset(event.params.asset);

  const oracle = getOracle(event.params.asset);

  const price = getPrice(oracle);

  const currentLiquidated = formatUnits(event.params.collateral_amount, collateralAsset.decimals);
  const liquidatedUSD = collateralAsset.liquidatedUSD.plus(currentLiquidated.times(price));

  const totalValueLocked = collateralAsset.totalValueLocked.minus(currentLiquidated);

  const totalValueLockedUSD = totalValueLocked.times(price).plus(liquidatedUSD);

  collateralAsset.totalValueLocked = totalValueLocked;
  collateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  collateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, collateralAsset.bituMinted);
  collateralAsset.liquidated = collateralAsset.liquidated.plus(currentLiquidated);
  collateralAsset.liquidatedUSD = liquidatedUSD;

  collateralAsset.save();

  loadCollateralAssetHourData(event.block.timestamp, collateralAsset, true);
  loadCollateralAssetDayData(event.block.timestamp, collateralAsset, true);
}
