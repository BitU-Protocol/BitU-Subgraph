import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../../generated/BitUMinting/BitUMinting";
import { ERC20_DECIMALS_NUMBER } from "../constants";
import { formatUnits } from "../utils/formatUnits";
import { loadUser, loadUserCollateralAsset } from "../utils/load";
import { getOracle, getPrice } from "../utils/oracle";

export function handleUserCollateralAssetInMintEvent(event: MintEvent): void {
  const user = loadUser(event.params.minter);
  const userCollateralAsset = loadUserCollateralAsset(event.params.minter, event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  const totalValueLocked = userCollateralAsset.totalValueLocked.plus(
    formatUnits(event.params.collateral_amount, userCollateralAsset.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price).plus(userCollateralAsset.liquidatedUSD);

  const fees = userCollateralAsset.fees.plus(formatUnits(event.params.mintfee, userCollateralAsset.decimals));
  const feesUSD = fees.times(price);

  const bituMinted = userCollateralAsset.bituMinted.plus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  userCollateralAsset.totalValueLocked = totalValueLocked;
  userCollateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  userCollateralAsset.fees = fees;
  userCollateralAsset.feesUSD = feesUSD;
  userCollateralAsset.bituMinted = bituMinted;
  userCollateralAsset.collateralRatio = totalValueLockedUSD.div(bituMinted);
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

  const totalValueLockedUSD = totalValueLocked.times(price).plus(userCollateralAsset.liquidatedUSD);

  const bituMinted = userCollateralAsset.bituMinted.minus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  userCollateralAsset.totalValueLocked = totalValueLocked;
  userCollateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  userCollateralAsset.bituMinted = bituMinted;
  userCollateralAsset.bituBurned = userCollateralAsset.bituBurned.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );
  userCollateralAsset.collateralRatio = totalValueLockedUSD.div(bituMinted);
  userCollateralAsset.user = user.id;

  userCollateralAsset.save();
}

export function handleUserCollateralAssetInLiqiudationEvent(event: LiqiudationEvent): void {
  const user = loadUser(event.params.user);
  const userCollateralAsset = loadUserCollateralAsset(event.params.user, event.params.asset);

  const oracle = getOracle(event.params.asset);

  const price = getPrice(oracle);

  const currentLiquidated = formatUnits(event.params.collateral_amount, userCollateralAsset.decimals);
  const liquidatedUSD = userCollateralAsset.liquidatedUSD.plus(currentLiquidated.times(price));

  const totalValueLocked = userCollateralAsset.totalValueLocked.minus(currentLiquidated);

  const totalValueLockedUSD = totalValueLocked.times(price).plus(liquidatedUSD);

  userCollateralAsset.totalValueLocked = totalValueLocked;
  userCollateralAsset.totalValueLockedUSD = totalValueLockedUSD;
  userCollateralAsset.collateralRatio = totalValueLockedUSD.div(userCollateralAsset.bituMinted);
  userCollateralAsset.liquidated = userCollateralAsset.liquidated.plus(currentLiquidated);
  userCollateralAsset.liquidatedUSD = liquidatedUSD;
  userCollateralAsset.user = user.id;

  userCollateralAsset.save();
}
