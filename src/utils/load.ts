import { Address, Bytes } from "@graphprotocol/graph-ts";
import {
  CollateralAsset,
  RewardTotal,
  Token,
  User,
  UserCollateralAsset,
  TokenHolder,
  Holder,
} from "../../generated/schema";
import { getDecimals, getName, getSymbol } from "./token";
import { BIG_DECIMAL_ZERO, BIG_INT_ONE, BIG_INT_ZERO, INITIALIZE_REWARD_TIMESTAMP } from "../constants";

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
    assetToken.assetLiquidated = BIG_DECIMAL_ZERO;
    assetToken.assetLiquidatedUSD = BIG_DECIMAL_ZERO;
    assetToken.bituLiquidated = BIG_DECIMAL_ZERO;
    assetToken.userCount = BIG_INT_ZERO;

    assetToken.save();
  }

  return assetToken as CollateralAsset;
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
    userAssetToken.assetLiquidated = BIG_DECIMAL_ZERO;
    userAssetToken.assetLiquidatedUSD = BIG_DECIMAL_ZERO;
    userAssetToken.bituLiquidated = BIG_DECIMAL_ZERO;
    userAssetToken.tokenAddress = token.toHexString();
    userAssetToken.user = user.toHexString();

    const collateralAsset = loadCollateralAsset(token);
    collateralAsset.userCount = collateralAsset.userCount.plus(BIG_INT_ONE);

    userAssetToken.save();
    collateralAsset.save();
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

export function loadRewardTotal(id: string): RewardTotal {
  let rewardTotal = RewardTotal.load(id);

  if (!rewardTotal) {
    rewardTotal = new RewardTotal(id);
    rewardTotal.total = BIG_DECIMAL_ZERO;
    rewardTotal.dyr = BIG_DECIMAL_ZERO;
    rewardTotal.lastAmount = BIG_DECIMAL_ZERO;
    rewardTotal.lastNewVestingBITUAmount = BIG_DECIMAL_ZERO;
    rewardTotal.lastBlockNumber = BIG_INT_ZERO;
    rewardTotal.lastTimestamp = INITIALIZE_REWARD_TIMESTAMP;
    rewardTotal.lastTransactionHash = Bytes.fromI32(0);

    rewardTotal.previousDateTotal = BIG_DECIMAL_ZERO;
    rewardTotal.previousDateTimestamp = INITIALIZE_REWARD_TIMESTAMP;

    rewardTotal.save();
  }

  return rewardTotal as RewardTotal;
}

export function loadToken(address: Address): Token {
  let token = Token.load(address.toHexString());

  if (!token) {
    token = new Token(address.toHexString());
    token.symbol = getSymbol(address);
    token.name = getName(address);
    token.decimals = getDecimals(address);
    token.totalSupply = BIG_DECIMAL_ZERO;
    token.holderCount = BIG_INT_ZERO;
    token.save();
  }

  return token as Token;
}

export function loadTokenHolder(holder: Address, tokenAddress: Address): TokenHolder {
  const id = holder.toHexString().concat("-").concat(tokenAddress.toHexString());
  let tokenHolder = TokenHolder.load(id);

  if (!tokenHolder) {
    tokenHolder = new TokenHolder(id);
    tokenHolder.symbol = getSymbol(tokenAddress);
    tokenHolder.name = getName(tokenAddress);
    tokenHolder.decimals = getDecimals(tokenAddress);
    tokenHolder.balance = BIG_DECIMAL_ZERO;
    tokenHolder.tokenAddress = tokenAddress.toHexString();
    tokenHolder.holder = holder.toHexString();

    const token = loadToken(tokenAddress);
    token.holderCount = token.holderCount.plus(BIG_INT_ONE);

    token.save();
    tokenHolder.save();
  }

  return tokenHolder as TokenHolder;
}

export function loadHolder(address: Address): Holder {
  let holder = Holder.load(address.toHexString());

  if (!holder) {
    holder = new Holder(address.toHexString());
    holder.save();
  }

  return holder as Holder;
}
