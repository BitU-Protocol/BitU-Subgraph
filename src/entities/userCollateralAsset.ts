import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../../generated/BitUMinting/BitUMinting";
import { ERC20_DECIMALS_NUMBER } from "../constants";
import { formatUnits } from "../utils/formatUnits";
import { loadUser, loadUserCollateralAsset } from "../utils/load";
import { getOracle, getPrice } from "../utils/oracle";
import { safeDiv } from "../utils/safeDiv";

export function handleUserCollateralAssetInMintEvent(event: MintEvent): void {
  const user = loadUser(event.params.minter);
  const userCollateralAsset = loadUserCollateralAsset(event.params.minter, event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  const totalValueLocked = userCollateralAsset.totalValueLocked.plus(
    formatUnits(event.params.collateral_amount, userCollateralAsset.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price);

  const fees = userCollateralAsset.fees.plus(formatUnits(event.params.mintfee, userCollateralAsset.decimals));
  const feesUSD = fees.times(price);

  const bituMinted = userCollateralAsset.bituMinted.plus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  userCollateralAsset.totalValueLocked = totalValueLocked;
  userCollateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  userCollateralAsset.fees = fees;
  userCollateralAsset.feesUSD = feesUSD;
  userCollateralAsset.bituMinted = bituMinted;
  userCollateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, bituMinted);
  userCollateralAsset.user = user.id;

  userCollateralAsset.save();
}

export function handleUserCollateralAssetInRedeemEvent(event: RedeemEvent): void {
  const user = loadUser(event.params.redeemer);
  const userCollateralAsset = loadUserCollateralAsset(event.params.redeemer, event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  const totalValueLocked = userCollateralAsset.totalValueLocked.minus(
    formatUnits(event.params.collateral_amount, userCollateralAsset.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price);

  const bituMinted = userCollateralAsset.bituMinted.minus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  userCollateralAsset.totalValueLocked = totalValueLocked;
  userCollateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  userCollateralAsset.bituMinted = bituMinted;
  userCollateralAsset.bituBurned = userCollateralAsset.bituBurned.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );
  userCollateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, bituMinted);
  userCollateralAsset.user = user.id;

  userCollateralAsset.save();
}

export function handleUserCollateralAssetInLiqiudationEvent(event: LiqiudationEvent): void {
  const user = loadUser(event.params.user);
  const userCollateralAsset = loadUserCollateralAsset(event.params.user, event.params.asset);

  const oracle = getOracle(event.params.asset);

  const price = getPrice(oracle);

  const currentAssetLiquidated = formatUnits(event.params.collateral_amount, userCollateralAsset.decimals);
  const assetLiquidatedUSD = userCollateralAsset.assetLiquidatedUSD.plus(currentAssetLiquidated.times(price));

  const totalValueLocked = userCollateralAsset.totalValueLocked.minus(currentAssetLiquidated);

  const totalValueLockedUSD = totalValueLocked.times(price);

  userCollateralAsset.totalValueLocked = totalValueLocked;
  userCollateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  userCollateralAsset.collateralRatio = safeDiv(totalValueLockedUSD, userCollateralAsset.bituMinted);
  userCollateralAsset.assetLiquidated = userCollateralAsset.assetLiquidated.plus(currentAssetLiquidated);
  userCollateralAsset.assetLiquidatedUSD = assetLiquidatedUSD;
  userCollateralAsset.bituLiquidated = userCollateralAsset.bituLiquidated.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );
  userCollateralAsset.user = user.id;

  userCollateralAsset.save();
}
