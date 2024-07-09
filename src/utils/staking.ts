import { BigDecimal } from "@graphprotocol/graph-ts";
import { BIG_DECIMAL_ZERO, ERC20_DECIMALS_NUMBER, SBITU_ADDRESS } from "../constants";
import { formatUnits } from "./formatUnits";
import { BitUStaking as BitUStakingABI } from "../../generated/BitUStaking/BitUStaking";

export function getTotalAssets(): BigDecimal {
  let totalAssetsValue = BIG_DECIMAL_ZERO;
  const contract = BitUStakingABI.bind(SBITU_ADDRESS);
  const totalAssets = contract.try_totalAssets();

  if (!totalAssets.reverted) {
    totalAssetsValue = formatUnits(totalAssets.value, ERC20_DECIMALS_NUMBER);
  }
  return totalAssetsValue;
}