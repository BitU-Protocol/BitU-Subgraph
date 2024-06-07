import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { CollateralToken } from "../../generated/schema";
import { ERC20 as ERC20ABI } from "../../generated/BitUMinting/ERC20";
import { BitUMinting as BitUMintingABI } from "../../generated/BitUMinting/BitUMinting";
import { ERC20SymbolBytes as ERC20SymbolBytesABI } from "../../generated/BitUMinting/ERC20SymbolBytes";
import { ERC20NameBytes as ERC20NameBytesABI } from "../../generated/BitUMinting/ERC20NameBytes";
import { AccessControlledAggregator as AccessControlledAggregatorABI } from "../../generated/BitUMinting/AccessControlledAggregator";
import {
  ADDRESS_ZERO,
  BIG_DECIMAL_ZERO,
  BIG_INT_ZERO,
  BITU_MINTING_ADDRESS,
  NULL_CALL_RESULT_VALUE,
} from "../constants";

export function loadCollateralToken(address: Address): CollateralToken {
  let token = CollateralToken.load(address.toHexString());

  if (!token) {
    token = new CollateralToken(address.toHexString());
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
    token.userCount = BIG_INT_ZERO;

    token.save();
  }

  return token as CollateralToken;
}

export function getSymbol(address: Address): string {
  const contract = ERC20ABI.bind(address);
  const contractSymbolBytes = ERC20SymbolBytesABI.bind(address);

  let tokenSymbol = "unknown";
  const symbolResultCall = contract.try_symbol();
  if (symbolResultCall.reverted) {
    const symbolResultBytesCall = contractSymbolBytes.try_symbol();
    if (!symbolResultBytesCall.reverted) {
      // for broken tokens that have no symbol function exposed
      if (symbolResultBytesCall.value.toHex() != NULL_CALL_RESULT_VALUE) {
        tokenSymbol = symbolResultBytesCall.value.toString();
      }
    }
  } else {
    tokenSymbol = symbolResultCall.value;
  }

  return tokenSymbol;
}

export function getName(address: Address): string {
  const contract = ERC20ABI.bind(address);
  const contractNameBytes = ERC20NameBytesABI.bind(address);

  let tokenName = "unknown";
  const tokenNameCall = contract.try_name();
  if (tokenNameCall.reverted) {
    const nameResultBytesCall = contractNameBytes.try_name();
    if (!nameResultBytesCall.reverted) {
      // for broken tokens that have no name function exposed
      if (nameResultBytesCall.value.toHex() !== NULL_CALL_RESULT_VALUE) {
        tokenName = nameResultBytesCall.value.toString();
      }
    }
  } else {
    tokenName = tokenNameCall.value;
  }

  return tokenName;
}

export function getTotalSupply(address: Address): BigInt {
  const contract = ERC20ABI.bind(address);

  let totalSupplyValue = BIG_INT_ZERO;
  const totalSupplyCall = contract.try_totalSupply();
  if (!totalSupplyCall.reverted) {
    totalSupplyValue = totalSupplyCall.value;
  }

  return totalSupplyValue;
}

export function getDecimals(address: Address): BigInt {
  const contract = ERC20ABI.bind(address);

  let decimalsValue = BigInt.fromI32(18); // use 18 decimals as default
  const decimalsValueCall = contract.try_decimals();
  if (!decimalsValueCall.reverted) {
    decimalsValue = BigInt.fromI32(decimalsValueCall.value);
  }

  return decimalsValue;
}

export function getPrice(address: Address): BigDecimal {
  const contract = AccessControlledAggregatorABI.bind(address);

  let priceValue = BIG_INT_ZERO.toBigDecimal();
  let decimalsValue = 8; // use 8 decimals as default

  const lastRoundDataResultCall = contract.try_latestRoundData();
  const decimalsValueCall = contract.try_decimals();

  if (!decimalsValueCall.reverted) {
    decimalsValue = decimalsValueCall.value;
  }
  if (!lastRoundDataResultCall.reverted) {
    const answer = lastRoundDataResultCall.value.getAnswer();
    priceValue = answer.divDecimal(
      BigInt.fromI32(10)
        .pow(decimalsValue as u8)
        .toBigDecimal()
    );
  }

  log.debug("price", [address.toString(), priceValue.toString()]);

  return priceValue;
}

export function getOracle(address: Address): Address {
  let oracleValue = ADDRESS_ZERO;
  const contract = BitUMintingABI.bind(BITU_MINTING_ADDRESS);
  const oracleInfo = contract.try_oracles(address);

  if (!oracleInfo.reverted) {
    oracleValue = oracleInfo.value;
  }
  log.debug("oracleInfo", [oracleInfo.value.toString(), oracleInfo.reverted.toString(), oracleValue.toString()]);
  return oracleValue;
}
