import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../generated/BitUMinting/BitUMinting";
import { Liqiudation, Mint, Redeem } from "../generated/schema";
import {
  handleCollateralAssetInLiqiudationEvent,
  handleCollateralAssetInMintEvent,
  handleCollateralAssetInRedeemEvent,
} from "./entities/collateralAsset";
import {
  handleUserCollateralAssetInLiqiudationEvent,
  handleUserCollateralAssetInMintEvent,
  handleUserCollateralAssetInRedeemEvent,
} from "./entities/userCollateralAsset";

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

  handleCollateralAssetInMintEvent(event);
  handleUserCollateralAssetInMintEvent(event);
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

  handleCollateralAssetInRedeemEvent(event);
  handleUserCollateralAssetInRedeemEvent(event);
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

  handleCollateralAssetInLiqiudationEvent(event);
  handleUserCollateralAssetInLiqiudationEvent(event);
}
