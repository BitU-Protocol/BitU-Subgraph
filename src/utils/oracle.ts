import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { BitUMinting as BitUMintingABI } from "../../generated/BitUMinting/BitUMinting";
import { AccessControlledAggregator as AccessControlledAggregatorABI } from "../../generated/BitUMinting/AccessControlledAggregator";
import { ADDRESS_ZERO, BIG_INT_ZERO, BITU_MINTING_ADDRESS } from "../constants";

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

  log.debug("[Oracle Price] {}", [address.toString(), priceValue.toString()]);

  return priceValue;
}

export function getOracle(address: Address): Address {
  let oracleValue = ADDRESS_ZERO;
  const contract = BitUMintingABI.bind(BITU_MINTING_ADDRESS);
  const oracleInfo = contract.try_oracles(address);

  if (!oracleInfo.reverted) {
    oracleValue = oracleInfo.value;
  }
  log.debug("Oracle {}", [oracleValue.toString()]);
  return oracleValue;
}
