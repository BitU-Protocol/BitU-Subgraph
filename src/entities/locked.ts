import { Stake as StakeEvent, Unstake as UnstakeEvent } from "../../generated/BitULocking/BitULocking";
import { loadLockedToken, loadUserLocked, loadUserLockedToken } from "../utils/load";
import { formatUnits } from "../utils/formatUnits";

export function handleLockedTokenInStake(event: StakeEvent): void {
  const lockedToken = loadLockedToken(event.params.lpToken);

  lockedToken.lockedTotal = lockedToken.lockedTotal.plus(formatUnits(event.params.amount, lockedToken.decimals));

  lockedToken.save();
}

export function handleLockedTokenInUnstake(event: UnstakeEvent): void {
  const lockedToken = loadLockedToken(event.params.lpToken);

  lockedToken.lockedTotal = lockedToken.lockedTotal.minus(formatUnits(event.params.amount, lockedToken.decimals));

  lockedToken.save();
}

export function handleUserLockedTokenInStake(event: StakeEvent): void {
  const userLockedToken = loadUserLockedToken(event.params.user, event.params.lpToken);
  const userLocked = loadUserLocked(event.params.user);

  userLockedToken.lockedAmount = userLockedToken.lockedAmount.plus(
    formatUnits(event.params.amount, userLockedToken.decimals)
  );
  userLockedToken.user = userLocked.id;

  userLockedToken.save();
}

export function handleUserLockedTokenInUnstake(event: UnstakeEvent): void {
  const userLockedToken = loadUserLockedToken(event.params.user, event.params.lpToken);
  const userLocked = loadUserLocked(event.params.user);

  userLockedToken.lockedAmount = userLockedToken.lockedAmount.minus(
    formatUnits(event.params.amount, userLockedToken.decimals)
  );
  userLockedToken.user = userLocked.id;

  userLockedToken.save();
}
