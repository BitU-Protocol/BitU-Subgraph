import { Transfer as TransferEvent } from "../../generated/BITU/ERC20";
import { loadHolder, loadToken, loadTokenHolder } from "../utils/load";
import { ADDRESS_ZERO } from "../constants";
import { formatUnits } from "../utils/formatUnits";

export function handleTokenInTransferEvent(event: TransferEvent): void {
  const token = loadToken(event.address);

  if (event.params.from.equals(ADDRESS_ZERO)) {
    token.totalSupply = token.totalSupply.plus(formatUnits(event.params.value, token.decimals));
  }

  if (event.params.to.equals(ADDRESS_ZERO)) {
    token.totalSupply = token.totalSupply.minus(formatUnits(event.params.value, token.decimals));
  }
  token.save();
}

export function handleTokenHolderInTransferEvent(event: TransferEvent): void {
  if (event.params.from.equals(ADDRESS_ZERO)) {
    const holder = loadHolder(event.params.to);
    const tokenHolder = loadTokenHolder(event.params.to, event.address);
    tokenHolder.balance = tokenHolder.balance.plus(formatUnits(event.params.value, tokenHolder.decimals));
    tokenHolder.holder = holder.id;
    tokenHolder.save();
  } else if (event.params.to.equals(ADDRESS_ZERO)) {
    const holder = loadHolder(event.params.from);
    const tokenHolder = loadTokenHolder(event.params.from, event.address);
    tokenHolder.balance = tokenHolder.balance.minus(formatUnits(event.params.value, tokenHolder.decimals));
    tokenHolder.holder = holder.id;
    tokenHolder.save();
  } else {
    const holderFrom = loadHolder(event.params.from);
    const holderTo = loadHolder(event.params.to);

    const tokenHolderFrom = loadTokenHolder(event.params.from, event.address);
    const tokenHolderTo = loadTokenHolder(event.params.from, event.address);

    tokenHolderFrom.balance = tokenHolderFrom.balance.minus(formatUnits(event.params.value, tokenHolderFrom.decimals));
    tokenHolderFrom.holder = holderFrom.id;
    tokenHolderFrom.save();

    tokenHolderTo.balance = tokenHolderTo.balance.plus(formatUnits(event.params.value, tokenHolderTo.decimals));
    tokenHolderTo.holder = holderTo.id;
    tokenHolderTo.save();
  }
}
