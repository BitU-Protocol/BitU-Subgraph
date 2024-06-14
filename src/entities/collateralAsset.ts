import { log } from "@graphprotocol/graph-ts";
import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../../generated/BitUMinting/BitUMinting";
import { ERC20_DECIMALS_NUMBER } from "../constants";
import { formatUnits } from "../utils/formatUnits";
import { loadCollateralAsset } from "../utils/load";
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
