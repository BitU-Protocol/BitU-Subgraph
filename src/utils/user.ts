import { Address } from "@graphprotocol/graph-ts";
import { User, UserCollateralToken } from "../../generated/schema";
import { getDecimals, getName, getSymbol } from "./token";
import { BIG_DECIMAL_ZERO } from "../constants";

export function loadUserCollateralToken(address: Address): UserCollateralToken {
  let token = UserCollateralToken.load(address.toHexString());

  if (!token) {
    token = new UserCollateralToken(address.toHexString());
    token.symbol = getSymbol(address);
    token.name = getName(address);
    token.decimals = getDecimals(address);
    token.totalValueLocked = BIG_DECIMAL_ZERO;
    token.totalValueLockedUSD = BIG_DECIMAL_ZERO;
    token.fees = BIG_DECIMAL_ZERO;
    token.feesUSD = BIG_DECIMAL_ZERO;
    token.bituMinted = BIG_DECIMAL_ZERO;
    token.bituBurned = BIG_DECIMAL_ZERO;
    token.collateralRatio = BIG_DECIMAL_ZERO;
    token.liquidated = BIG_DECIMAL_ZERO;
    token.liquidatedUSD = BIG_DECIMAL_ZERO;
    token.save();
  }

  return token as UserCollateralToken;
}

export function loadUser(address: Address): User {
  let user = User.load(address.toHexString());

  if (!user) {
    user = new User(address.toHexString());
    user.save();
  }

  return user as User;
}
