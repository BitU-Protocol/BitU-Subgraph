import { Address, BigInt } from "@graphprotocol/graph-ts";
import { ERC20 as ERC20ABI } from "../../generated/BitUMinting/ERC20";
import { ERC20SymbolBytes as ERC20SymbolBytesABI } from "../../generated/BitUMinting/ERC20SymbolBytes";
import { ERC20NameBytes as ERC20NameBytesABI } from "../../generated/BitUMinting/ERC20NameBytes";
import { BIG_INT_ZERO, NULL_CALL_RESULT_VALUE } from "../constants";

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
