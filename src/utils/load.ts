import { Address } from "@graphprotocol/graph-ts";
import { CollateralAsset } from "../../generated/schema";
import { getDecimals, getName, getSymbol } from "./token";
import { BIG_DECIMAL_ZERO, BIG_INT_ZERO } from "../constants";

export function loadCollateralAsset(address: Address): CollateralAsset {
  let assetToken = CollateralAsset.load(address.toHexString());

  if (!assetToken) {
    assetToken = new CollateralAsset(address.toHexString());
    assetToken.symbol = getSymbol(address);
    assetToken.name = getName(address);
    assetToken.decimals = getDecimals(address);
    assetToken.totalValueLocked = BIG_DECIMAL_ZERO;
    assetToken.totalValueLockedUSD = BIG_DECIMAL_ZERO;
    assetToken.fees = BIG_DECIMAL_ZERO;
    assetToken.feesUSD = BIG_DECIMAL_ZERO;
    assetToken.bituMinted = BIG_DECIMAL_ZERO;
    assetToken.bituBurned = BIG_DECIMAL_ZERO;
    assetToken.collateralRatio = BIG_DECIMAL_ZERO;
    assetToken.liquidated = BIG_DECIMAL_ZERO;
    assetToken.liquidatedUSD = BIG_DECIMAL_ZERO;
    assetToken.userCount = BIG_INT_ZERO;

    assetToken.save();
  }

  return assetToken as CollateralAsset;
}
