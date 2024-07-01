import { Stake as StakeEvent, Unstake as UnstakeEvent } from "../generated/BitULocking/BitULocking";
import {
  handleLockedTokenInStake,
  handleLockedTokenInUnstake,
  handleUserLockedTokenInStake,
  handleUserLockedTokenInUnstake,
} from "./entities/locked";

export function handleStake(event: StakeEvent): void {
  handleLockedTokenInStake(event);
  handleUserLockedTokenInStake(event);
}

export function handleUnstake(event: UnstakeEvent): void {
  handleLockedTokenInUnstake(event);
  handleUserLockedTokenInUnstake(event);
}
