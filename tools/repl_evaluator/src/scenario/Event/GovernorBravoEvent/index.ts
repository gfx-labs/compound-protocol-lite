import { Event } from "../../Event";
import { World } from "../../World";
import {
  getAddressV,
  getArrayV,
  getEventV,
  getNumberV,
  getStringV,
  getCoreValue,
} from "../../CoreValue";
import { AddressV, ArrayV, EventV, NumberV, StringV } from "../../Value";
import { Arg, Command, processCommandEvent } from "../../Command";
import { processProposalEvent } from "../BravoProposalEvent";
import { encodeParameters, rawValues } from "../../Utils";
import { getGovernorV } from "../../Value/GovernorBravoValue";

import {
  acceptAdmin,
  genGovernor,
  GovernorBravo,
  harnessInitiate,
  initiate,
  mergeABI,
  propose,
  setImplementation,
  setPendingAdmin,
  setProposalThreshold,
  setVotingDelay,
  setVotingPeriod,
} from "./GovernorBravoHelpers";
export const governorBravoCommands = () => {
  return [
    new Command<{ params: EventV }>(
      `
        #### Deploy

        * "Deploy ../...params" - Generates a new Governor
        * E.g. "Governor Deploy BravoDelegate"
      `,
      "Deploy",
      [new Arg("params", getEventV, { variadic: true })],
      (world, from, { params }) => genGovernor(world, from, params.val)
    ),

    new Command<{
      governor: GovernorBravo;
      description: StringV;
      targets: ArrayV<AddressV>;
      values: ArrayV<NumberV>;
      signatures: ArrayV<StringV>;
      callDataArgs: ArrayV<ArrayV<StringV>>;
    }>(
      `
        #### Propose

        * "Governor <Governor> Propose description:<String> targets:<List> signatures:<List> callDataArgs:<List>" - Creates a new proposal in Governor
        * E.g. "Governor GovernorScenario Propose "New Interest Rate" [(Address cDAI)] [0] [("_setInterestRateModel(address)")] [[(Address MyInterestRateModel)]]
      `,
      "Propose",
      [
        new Arg("governor", getGovernorV),
        new Arg("description", getStringV),
        new Arg("targets", getArrayV(getAddressV)),
        new Arg("values", getArrayV(getNumberV)),
        new Arg("signatures", getArrayV(getStringV)),
        new Arg("callDataArgs", getArrayV(getArrayV(getCoreValue))),
      ],
      async (
        world,
        from,
        { governor, description, targets, values, signatures, callDataArgs }
      ) => {
        const targetsU = targets.val.map((a) => a.val);
        const valuesU = values.val.map((a) => a.encode());
        const signaturesU = signatures.val.map((a) => a.val);
        const callDatasU: string[] = signatures.val.reduce((acc, cur, idx) => {
          const args = rawValues(callDataArgs.val[idx]);
          acc.push(encodeParameters(world, cur.val, args));
          return acc;
        }, <string[]>[]);
        return await propose(
          world,
          from,
          governor,
          targetsU,
          valuesU,
          signaturesU,
          callDatasU,
          description.val
        );
      },
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo; params: EventV }>(
      `
        #### Proposal

        * "GovernorBravo <Governor> Proposal <proposalEvent>" - Returns information about a proposal
        * E.g. "GovernorBravo GovernorScenario Proposal LastProposal Vote For"
      `,
      "Proposal",
      [
        new Arg("governor", getGovernorV),
        new Arg("params", getEventV, { variadic: true }),
      ],
      (world, from, { governor, params }) =>
        processProposalEvent(world, governor, params.val, from),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo; blockNumber: NumberV }>(
      `
        #### SetBlockNumber

        * "Governor <Governor> SetBlockNumber <Seconds>" - Sets the blockNumber of the Governance Harness
        * E.g. "GovernorBravo SetBlockNumber 500"
    `,
      "SetBlockNumber",
      [new Arg("governor", getGovernorV), new Arg("blockNumber", getNumberV)],
      (world, from, { governor, blockNumber }) => {
        return Promise.resolve(world);
        //setBlockNumber(world, from, governor, blockNumber),{ namePos: 1 }
      }
    ),
    new Command<{ governor: GovernorBravo; blockTimestamp: NumberV }>(
      `
        #### SetBlockTimestamp

        * "Governor <Governor> SetBlockNumber <Seconds>" - Sets the blockTimestamp of the Governance Harness
        * E.g. "GovernorBravo GovernorScenario SetBlockTimestamp 500"
    `,
      "SetBlockTimestamp",
      [
        new Arg("governor", getGovernorV),
        new Arg("blockTimestamp", getNumberV),
      ],
      (world, from, { governor, blockTimestamp }) => {
        return Promise.resolve(world);
      }
    ),

    new Command<{ governor: GovernorBravo; newVotingDelay: NumberV }>(
      `
        #### SetVotingDelay

        * "GovernorBravo <Governor> SetVotingDelay <Blocks>" - Sets the voting delay of the GovernorBravo
        * E.g. "GovernorBravo GovernorBravoScenario SetVotingDelay 2"
    `,
      "SetVotingDelay",
      [
        new Arg("governor", getGovernorV),
        new Arg("newVotingDelay", getNumberV),
      ],
      (world, from, { governor, newVotingDelay }) =>
        setVotingDelay(world, from, governor, newVotingDelay),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo; newVotingPeriod: NumberV }>(
      `
        #### SetVotingPeriod

        * "GovernorBravo <Governor> SetVotingPeriod <Blocks>" - Sets the voting period of the GovernorBravo
        * E.g. "GovernorBravo GovernorBravoScenario SetVotingPeriod 500"
    `,
      "SetVotingPeriod",
      [
        new Arg("governor", getGovernorV),
        new Arg("newVotingPeriod", getNumberV),
      ],
      (world, from, { governor, newVotingPeriod }) =>
        setVotingPeriod(world, from, governor, newVotingPeriod),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo; newProposalThreshold: NumberV }>(
      `
        #### SetProposalThreshold

        * "GovernorBravo <Governor> SetProposalThreshold <Comp>" - Sets the proposal threshold of the GovernorBravo
        * E.g. "GovernorBravo GovernorBravoScenario SetProposalThreshold 500e18"
    `,
      "SetProposalThreshold",
      [
        new Arg("governor", getGovernorV),
        new Arg("newProposalThreshold", getNumberV),
      ],
      (world, from, { governor, newProposalThreshold }) =>
        setProposalThreshold(world, from, governor, newProposalThreshold),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo; governorAlpha: AddressV }>(
      `
        #### Initiate

        * "GovernorBravo <Governor> Initiate <AddressV>" - Initiates the Governor relieving the given GovernorAlpha
        * E.g. "GovernorBravo GovernorBravoScenario Initiate (Address GovernorAlpha)"
    `,
      "Initiate",
      [
        new Arg("governor", getGovernorV),
        new Arg("governorAlpha", getAddressV),
      ],
      (world, from, { governor, governorAlpha }) =>
        initiate(world, from, governor, governorAlpha.val),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo }>(
      `
        #### HarnessInitiate

        * "GovernorBravo <Governor> HarnessInitiate" - Uses harness function to bypass initiate for testing
        * E.g. "GovernorBravo GovernorBravoScenario HarnessInitiate"
    `,
      "HarnessInitiate",
      [new Arg("governor", getGovernorV)],
      (world, from, { governor }) => harnessInitiate(world, from, governor),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo; newImplementation: GovernorBravo }>(
      `
        #### SetImplementation

        * "GovernorBravo <Governor> SetImplementation <Governor>" - Sets the address for the GovernorBravo implementation
        * E.g. "GovernorBravo GovernorBravoScenario SetImplementation newImplementation"
    `,
      "SetImplementation",
      [
        new Arg("governor", getGovernorV),
        new Arg("newImplementation", getGovernorV),
      ],
      (world, from, { governor, newImplementation }) =>
        setImplementation(world, from, governor, newImplementation),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo; newPendingAdmin: AddressV }>(
      `
        #### SetPendingAdmin

        * "GovernorBravo <Governor> SetPendingAdmin <AddressV>" - Sets the address for the GovernorBravo pending admin
        * E.g. "GovernorBravo GovernorBravoScenario SetPendingAdmin newAdmin"
    `,
      "SetPendingAdmin",
      [
        new Arg("governor", getGovernorV),
        new Arg("newPendingAdmin", getAddressV),
      ],
      (world, from, { governor, newPendingAdmin }) =>
        setPendingAdmin(world, from, governor, newPendingAdmin.val),
      { namePos: 1 }
    ),
    new Command<{ governor: GovernorBravo }>(
      `
        #### AcceptAdmin

        * "GovernorBravo <Governor> AcceptAdmin" - Pending admin accepts the admin role
        * E.g. "GovernorBravo GovernorBravoScenario AcceptAdmin"
    `,
      "AcceptAdmin",
      [new Arg("governor", getGovernorV)],
      (world, from, { governor }) => acceptAdmin(world, from, governor),
      { namePos: 1 }
    ),

    new Command<{
      governorDelegator: GovernorBravo;
      governorDelegate: GovernorBravo;
    }>(
      `#### MergeABI

        * "ComptrollerImpl <Impl> MergeABI" - Merges the ABI, as if it was a become.
        * E.g. "ComptrollerImpl MyImpl MergeABI
      `,
      "MergeABI",
      [
        new Arg("governorDelegator", getGovernorV),
        new Arg("governorDelegate", getGovernorV),
      ],
      (world, from, { governorDelegator, governorDelegate }) =>
        mergeABI(world, from, governorDelegator, governorDelegate),
      { namePos: 1 }
    ),
  ];
};

export const processGovernorBravoEvent = async (
  world: World,
  event: Event,
  from: string | null
): Promise<World> => {
  return await processCommandEvent<any>(
    "Governor",
    governorBravoCommands(),
    world,
    event,
    from
  );
};
