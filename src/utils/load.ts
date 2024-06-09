import { Address, BigInt } from "@graphprotocol/graph-ts";
import {
  CollateralAsset,
  CollateralAssetDayData,
  CollateralAssetHourData,
  Token,
  TokenDayData,
  TokenHourData,
  User,
  UserCollateralAsset,
} from "../../generated/schema";
import { getDecimals, getName, getSymbol, getTotalSupply } from "./token";
import { ADDRESS_ZERO, BIG_DECIMAL_ZERO, BIG_INT_ZERO } from "../constants";
import { formatUnits } from "./formatUnits";

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

export function loadCollateralAssetHourData(
  timestamp: BigInt,
  collateralAsset: CollateralAsset,
  update: bool
): CollateralAssetHourData {
  const SECONDS_IN_HOUR = BigInt.fromI32(60 * 60);
  const hourId = timestamp.div(SECONDS_IN_HOUR);
  const hourStartTimestamp = hourId.times(SECONDS_IN_HOUR);
  const id = collateralAsset.id.concat("-").concat(hourStartTimestamp.toString());

  let assetTokenHourData = CollateralAssetHourData.load(id);

  if (!assetTokenHourData) {
    assetTokenHourData = new CollateralAssetHourData(id);
    assetTokenHourData.date = hourStartTimestamp.toI32();
    assetTokenHourData.tokenAddress = collateralAsset.id;
    assetTokenHourData.collateralAsset = collateralAsset.id;
    assetTokenHourData.save();
  }

  if (update) {
    assetTokenHourData.tokenAddress = collateralAsset.id;
    assetTokenHourData.collateralAsset = collateralAsset.id;
    assetTokenHourData.save();
  }

  return assetTokenHourData as CollateralAssetHourData;
}

export function loadCollateralAssetDayData(
  timestamp: BigInt,
  collateralAsset: CollateralAsset,
  update: bool
): CollateralAssetDayData {
  const SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24);
  const dayId = timestamp.div(SECONDS_IN_DAY);
  const dayStartTimestamp = dayId.times(SECONDS_IN_DAY);
  const id = collateralAsset.id.concat("-").concat(dayStartTimestamp.toString());

  let assetTokenHourData = CollateralAssetDayData.load(id);

  if (!assetTokenHourData) {
    assetTokenHourData = new CollateralAssetDayData(id);
    assetTokenHourData.date = dayStartTimestamp.toI32();
    assetTokenHourData.tokenAddress = collateralAsset.id;
    assetTokenHourData.collateralAsset = collateralAsset.id;
    assetTokenHourData.save();
  }

  if (update) {
    assetTokenHourData.tokenAddress = collateralAsset.id;
    assetTokenHourData.collateralAsset = collateralAsset.id;
    assetTokenHourData.save();
  }

  return assetTokenHourData as CollateralAssetDayData;
}

export function loadUserCollateralAsset(user: Address, token: Address): UserCollateralAsset {
  const id = user.toHexString().concat("-").concat(token.toHexString());
  let userAssetToken = UserCollateralAsset.load(id);

  if (!userAssetToken) {
    userAssetToken = new UserCollateralAsset(id);
    userAssetToken.symbol = getSymbol(token);
    userAssetToken.name = getName(token);
    userAssetToken.decimals = getDecimals(token);
    userAssetToken.totalValueLocked = BIG_DECIMAL_ZERO;
    userAssetToken.totalValueLockedUSD = BIG_DECIMAL_ZERO;
    userAssetToken.fees = BIG_DECIMAL_ZERO;
    userAssetToken.feesUSD = BIG_DECIMAL_ZERO;
    userAssetToken.bituMinted = BIG_DECIMAL_ZERO;
    userAssetToken.bituBurned = BIG_DECIMAL_ZERO;
    userAssetToken.collateralRatio = BIG_DECIMAL_ZERO;
    userAssetToken.liquidated = BIG_DECIMAL_ZERO;
    userAssetToken.liquidatedUSD = BIG_DECIMAL_ZERO;
    userAssetToken.tokenAddress = token.toHexString();
    userAssetToken.user = user.toHexString();

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

export function loadToken(address: Address): Token {
  let token = Token.load(address.toHexString());

  if (!token) {
    token = new Token(address.toHexString());
    token.symbol = getSymbol(address);
    token.name = getName(address);
    token.decimals = getDecimals(address);
    const totalSupply = getTotalSupply(address);
    token.totalSupply = formatUnits(totalSupply, token.decimals);
    token.save();
  }

  return token as Token;
}

export function loadTokenHourData(timestamp: BigInt, token: Token, update: bool): TokenHourData {
  const SECONDS_IN_HOUR = BigInt.fromI32(60 * 60);
  const hourId = timestamp.div(SECONDS_IN_HOUR);
  const hourStartTimestamp = hourId.times(SECONDS_IN_HOUR);
  const id = token.id.concat("-").concat(hourStartTimestamp.toString());

  let tokenHourData = TokenHourData.load(id);

  if (!tokenHourData) {
    tokenHourData = new TokenHourData(id);
    tokenHourData.date = hourStartTimestamp.toI32();
    tokenHourData.token = token.id;
    tokenHourData.save();
  }

  if (update) {
    tokenHourData.token = token.id;
    tokenHourData.save();
  }

  return tokenHourData as TokenHourData;
}

export function loadTokenDayData(timestamp: BigInt, token: Token, update: bool): TokenDayData {
  const SECONDS_IN_DAY = BigInt.fromI32(60 * 60 * 24);
  const dayId = timestamp.div(SECONDS_IN_DAY);
  const dayStartTimestamp = dayId.times(SECONDS_IN_DAY);
  const id = token.id.concat("-").concat(dayStartTimestamp.toString());

  let tokenDayData = TokenDayData.load(id);

  if (!tokenDayData) {
    tokenDayData = new TokenDayData(id);
    tokenDayData.date = dayStartTimestamp.toI32();
    tokenDayData.token = token.id;
    tokenDayData.save();
  }

  if (update) {
    tokenDayData.token = token.id;
    tokenDayData.save();
  }

  return tokenDayData as TokenDayData;
}
