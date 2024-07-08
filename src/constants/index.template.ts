import { Address, BigInt, BigDecimal } from "@graphprotocol/graph-ts";

export const ADDRESS_ZERO = Address.fromString("0x0000000000000000000000000000000000000000");

export const BIG_DECIMAL_1E6 = BigDecimal.fromString("1e6");
export const BIG_DECIMAL_1E10 = BigDecimal.fromString("1e10");
export const BIG_DECIMAL_1E12 = BigDecimal.fromString("1e12");
export const BIG_DECIMAL_1E18 = BigDecimal.fromString("1e18");
export const BIG_DECIMAL_ZERO = BigDecimal.fromString("0");
export const BIG_DECIMAL_ONE = BigDecimal.fromString("1");
export const BIG_DECIMAL_HUNDRED = BigDecimal.fromString("100");

export const BIG_INT_ONE = BigInt.fromI32(1);
export const BIG_INT_ZERO = BigInt.fromI32(0);

export const NULL_CALL_RESULT_VALUE = "0x0000000000000000000000000000000000000000000000000000000000000001";

export const ERC20_DECIMALS = BigDecimal.fromString("1e18");

export const ERC20_DECIMALS_NUMBER = BigInt.fromI32(18);

export const DEFAULT_MINT_FEE = BigDecimal.fromString("0.0015");

export const BITU_MINTING_ADDRESS = Address.fromString("{{ bitu_minting_address }}");
export const BITU_ADDRESS = Address.fromString("{{ bitu_address }}");
export const SBITU_ADDRESS = Address.fromString("{{ sbitu_address }}");

export const INITIALIZE_REWARD_TIMESTAMP = BigInt.fromString("{{ initialize_reward_timestamp }}");
