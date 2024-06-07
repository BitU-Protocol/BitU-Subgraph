import { BigDecimal } from "@graphprotocol/graph-ts";
import { BitUMinting as BitUMintingABI } from "../../generated/BitUMinting/BitUMinting";
import { BITU_MINTING_ADDRESS } from "../constants";

export function getMintFeeRatio(): BigDecimal {
  let mintFeeRatio = BigDecimal.fromString("0.0015");
  const contract = BitUMintingABI.bind(BITU_MINTING_ADDRESS);
  const mintFeeRateValue = contract.try_mintFeeRate();
  const baseMintFeeRateValue = contract.try_baseMintFeeRate();

  if (!mintFeeRateValue.reverted && !baseMintFeeRateValue.reverted) {
    mintFeeRatio = mintFeeRateValue.value.div(baseMintFeeRateValue.value).toBigDecimal();
  }

  return mintFeeRatio;
}
