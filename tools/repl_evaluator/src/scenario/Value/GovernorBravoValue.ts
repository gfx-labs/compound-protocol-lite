import { Event } from "../Event";
import { World } from "../World";
import { GovernorBravoDelegate as GovernorBravo } from "../../../../../typechain/GovernorBravoDelegate";
import { getCoreValue, getEventV, mapValue } from "../CoreValue";
import { AddressV, NumberV, EventV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { getProposalValue } from "./BravoProposalValue";
import {
  getGovernorAddress,
  getWorldContractByAddress,
} from "../ContractLookup";

export async function getGovernorV(
  world: World,
  event: Event
): Promise<GovernorBravo> {
  const address = await mapValue<AddressV>(
    world,
    event,
    (str) => new AddressV(getGovernorAddress(world, str)),
    getCoreValue,
    AddressV
  );

  return getWorldContractByAddress<GovernorBravo>(world, address.val);
}

async function governorAddress(
  _world: World,
  governor: GovernorBravo
): Promise<AddressV> {
  return new AddressV(governor.address);
}

async function getAdmin(
  _world: World,
  governor: GovernorBravo
): Promise<AddressV> {
  return new AddressV(await governor.callStatic.admin());
}

async function getPendingAdmin(
  _world: World,
  governor: GovernorBravo
): Promise<AddressV> {
  return new AddressV(await governor.callStatic.pendingAdmin());
}

async function getImplementation(
  _world: World,
  governor: GovernorBravo
): Promise<AddressV> {
  return new AddressV(await governor.callStatic.implementation());
}

async function getProposalThreshold(
  _world: World,
  governor: GovernorBravo
): Promise<NumberV> {
  return new NumberV(await governor.callStatic.proposalThreshold());
}

async function getVotingPeriod(
  _world: World,
  governor: GovernorBravo
): Promise<NumberV> {
  return new NumberV(await governor.callStatic.votingPeriod());
}

async function getVotingDelay(
  _world: World,
  governor: GovernorBravo
): Promise<NumberV> {
  return new NumberV(await governor.callStatic.votingDelay());
}

export function governorBravoFetchers() {
  return [
    new Fetcher<{ governor: GovernorBravo }, AddressV>(
      `
        #### Address

        * "GovernorBravo <GovernorBravo> Address" - Returns the address of governorBravo contract
        * E.g. "GovernorBravo GovernorBravoScenario Address"
      `,
      "Address",
      [new Arg("governor", getGovernorV)],
      (world, { governor }) => governorAddress(world, governor),
      { namePos: 1 }
    ),

    new Fetcher<{ governor: GovernorBravo }, AddressV>(
      `
        #### Admin

        * "GovernorBravo <Governor> Admin" - Returns the address of governorBravo admin
        * E.g. "GovernorBravo GovernorBravoScenario Admin"
      `,
      "Admin",
      [new Arg("governor", getGovernorV)],
      (world, { governor }) => getAdmin(world, governor),
      { namePos: 1 }
    ),

    new Fetcher<{ governor: GovernorBravo }, AddressV>(
      `
        #### Pending Admin

        * "GovernorBravo <Governor> PendingAdmin" - Returns the address of governorBravo pending admin
        * E.g. "GovernorBravo GovernorBravoScenario PendingAdmin"
      `,
      "PendingAdmin",
      [new Arg("governor", getGovernorV)],
      (world, { governor }) => getPendingAdmin(world, governor),
      { namePos: 1 }
    ),

    new Fetcher<{ governor: GovernorBravo }, AddressV>(
      `
        #### Implementation

        * "GovernorBravo <Governor> Implementation" - Returns the address of governorBravo implementation
        * E.g. "GovernorBravo GovernorBravoScenario Implementation"
      `,
      "Implementation",
      [new Arg("governor", getGovernorV)],
      (world, { governor }) => getImplementation(world, governor),
      { namePos: 1 }
    ),

    new Fetcher<{ governor: GovernorBravo }, NumberV>(
      `
        #### ProposalThreshold

        * "GovernorBravo <Governor> ProposalThreshold" - Returns the proposal threshold of the given governorBravo
        * E.g. "GovernorBravo GovernorBravoScenario ProposalThreshold"
      `,
      "ProposalThreshold",
      [new Arg("governor", getGovernorV)],
      (world, { governor }) => getProposalThreshold(world, governor),
      { namePos: 1 }
    ),

    new Fetcher<{ governor: GovernorBravo }, NumberV>(
      `
        #### VotingPeriod

        * "GovernorBravo <Governor> VotingPeriod" - Returns the voting period of the given governorBravo
        * E.g. "GovernorBravo GovernorBravoScenario VotingPeriod"
      `,
      "VotingPeriod",
      [new Arg("governor", getGovernorV)],
      (world, { governor }) => getVotingPeriod(world, governor),
      { namePos: 1 }
    ),

    new Fetcher<{ governor: GovernorBravo }, NumberV>(
      `
        #### VotingDelay

        * "GovernorBravo <Governor> VotingDelay" - Returns the voting delay of the given governorBravo
        * E.g. "GovernorBravo GovernorBravoScenario VotingDelay"
      `,
      "VotingDelay",
      [new Arg("governor", getGovernorV)],
      (world, { governor }) => getVotingDelay(world, governor),
      { namePos: 1 }
    ),

    new Fetcher<{ governor: GovernorBravo; params: EventV }, Value>(
      `
        #### Proposal

        * "GovernorBravo <Governor> Proposal <...proposalValue>" - Returns information about a proposal
        * E.g. "GovernorBravo GovernorBravoScenario Proposal LastProposal Id"
      `,
      "Proposal",
      [
        new Arg("governor", getGovernorV),
        new Arg("params", getEventV, { variadic: true }),
      ],
      (world, { governor, params }) =>
        getProposalValue(world, governor, params.val),
      { namePos: 1 }
    ),
  ];
}

export async function getGovernorBravoValue(
  world: World,
  event: Event
): Promise<Value> {
  return await getFetcherValue<any, any>(
    "GovernorBravo",
    governorBravoFetchers(),
    world,
    event
  );
}
