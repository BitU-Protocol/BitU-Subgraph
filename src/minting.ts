import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../generated/BitUMinting/BitUMinting";
import { Liqiudation, Mint, Redeem } from "../generated/schema";
import { getOracle, getPrice, loadCollateralToken } from "./utils/token";
import { formatUnits } from "./utils/formatUnits";
import { ERC20_DECIMALS_NUMBER } from "./constants";
import { loadUser } from "./utils/user";

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

  const totalValueLockedUSD = totalValueLocked.times(price).plus(collateralToken.liquidatedUSD);

  const fees = collateralToken.fees.plus(formatUnits(event.params.mintfee, collateralToken.decimals));
  const feesUSD = fees.times(price);

  const bituMinted = collateralToken.bituMinted.plus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  collateralToken.totalValueLocked = totalValueLocked;
  collateralToken.totalValueLockedUSD = totalValueLockedUSD;
  collateralToken.fees = fees;
  collateralToken.feesUSD = feesUSD;
  collateralToken.bituMinted = bituMinted;
  collateralToken.collateralRatio = totalValueLockedUSD.div(bituMinted);

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

  const collateralToken = loadCollateralToken(event.params.collateral_asset);

  const oracle = getOracle(event.params.collateral_asset);

  const price = getPrice(oracle);

  const totalValueLocked = collateralToken.totalValueLocked.minus(
    formatUnits(event.params.collateral_amount, collateralToken.decimals)
  );

  const totalValueLockedUSD = totalValueLocked.times(price).plus(collateralToken.liquidatedUSD);

  const bituMinted = collateralToken.bituMinted.minus(formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER));

  collateralToken.totalValueLocked = totalValueLocked;
  collateralToken.totalValueLockedUSD = totalValueLockedUSD;
  collateralToken.bituMinted = bituMinted;
  collateralToken.bituBurned = collateralToken.bituBurned.plus(
    formatUnits(event.params.bitu_amount, ERC20_DECIMALS_NUMBER)
  );
  collateralToken.collateralRatio = totalValueLockedUSD.div(bituMinted);

  collateralToken.save();
}

export function handleLiqiudation(event: LiqiudationEvent): void {
  let entity = new Liqiudation(event.transaction.hash.concatI32(event.logIndex.toI32()));
  entity.user = event.params.user;
  entity.asset = event.params.asset;
  entity.collateral_amount = event.params.collateral_amount;
  entity.bitu_amount = event.params.bitu_amount;
  entity.collateral_ratio = event.params.collateral_ratio;
  entity.timestamp = event.params.timestamp;

  entity.blockNumber = event.block.number;
  entity.blockTimestamp = event.block.timestamp;
  entity.transactionHash = event.transaction.hash;

  entity.save();

  const collateralToken = loadCollateralToken(event.params.asset);

  const oracle = getOracle(event.params.asset);

  const price = getPrice(oracle);

  const currentLiquidated = formatUnits(event.params.collateral_amount, collateralToken.decimals);
  const liquidatedUSD = collateralToken.liquidatedUSD.plus(currentLiquidated.times(price));

  const totalValueLocked = collateralToken.totalValueLocked.minus(currentLiquidated);

  const totalValueLockedUSD = totalValueLocked.times(price).plus(liquidatedUSD);

  collateralToken.totalValueLocked = totalValueLocked;
  collateralToken.totalValueLockedUSD = totalValueLockedUSD;
  collateralToken.collateralRatio = totalValueLockedUSD.div(collateralToken.bituMinted);
  collateralToken.liquidated = collateralToken.liquidated.plus(currentLiquidated);
  collateralToken.liquidatedUSD = liquidatedUSD;

  collateralToken.save();
}
