import {
  Liqiudation as LiqiudationEvent,
  Mint as MintEvent,
  Redeem as RedeemEvent,
} from "../generated/BitUMinting/BitUMinting";
import { Redeem } from "../generated/schema";
import {
  handleCollateralAssetInLiqiudationEvent,
  handleCollateralAssetInMintEvent,
  handleCollateralAssetInRedeemEvent,
  handleRedeemStatistics,
} from "./entities/collateralAsset";
import {
  handleUserCollateralAssetInLiqiudationEvent,
  handleUserCollateralAssetInMintEvent,
  handleUserCollateralAssetInRedeemEvent,
} from "./entities/userCollateralAsset";

export function handleMint(event: MintEvent): void {
  handleCollateralAssetInMintEvent(event);
  handleUserCollateralAssetInMintEvent(event);
}

export function handleRedeem(event: RedeemEvent): void {
  handleRedeemStatistics(event);
  handleCollateralAssetInRedeemEvent(event);
  handleUserCollateralAssetInRedeemEvent(event);
}

export function handleLiqiudation(event: LiqiudationEvent): void {
  handleCollateralAssetInLiqiudationEvent(event);
  handleUserCollateralAssetInLiqiudationEvent(event);
}
