import { Address } from "@graphprotocol/graph-ts";
import { User, UserCollateralAsset } from "../../generated/schema";
import { getDecimals, getName, getSymbol } from "./token";
import { BIG_DECIMAL_ZERO } from "../constants";

export function loadUserCollateralAsset(address: Address): UserCollateralAsset {
  let userAssetToken = UserCollateralAsset.load(address.toHexString());

  if (!userAssetToken) {
    userAssetToken = new UserCollateralAsset(address.toHexString());
    userAssetToken.symbol = getSymbol(address);
    userAssetToken.name = getName(address);
    userAssetToken.decimals = getDecimals(address);
    userAssetToken.totalValueLocked = BIG_DECIMAL_ZERO;
    userAssetToken.totalValueLockedUSD = BIG_DECIMAL_ZERO;
    userAssetToken.fees = BIG_DECIMAL_ZERO;
    userAssetToken.feesUSD = BIG_DECIMAL_ZERO;
    userAssetToken.bituMinted = BIG_DECIMAL_ZERO;
    userAssetToken.bituBurned = BIG_DECIMAL_ZERO;
    userAssetToken.collateralRatio = BIG_DECIMAL_ZERO;
    userAssetToken.liquidated = BIG_DECIMAL_ZERO;
    userAssetToken.liquidatedUSD = BIG_DECIMAL_ZERO;
    userAssetToken.save();
  }

  return userAssetToken as UserCollateralAsset;
}

export function loadUser(address: Address): User {
  let user = User.load(address.toHexString());

  if (!user) {
    user = new User(address.toHexString());
    user.save();
  }

  return user as User;
}
