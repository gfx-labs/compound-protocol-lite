import { Event } from "../Event";
import { World } from "../World";
import { getAddress } from "../ContractLookup";
import {
  getAddressV,
  getArrayV,
  getEventV,
  getNumberV,
  getStringV,
} from "../CoreValue";
import { AddressV, BoolV, EventV, NumberV, StringV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { encodedNumber } from "../Encoding";
import {
  GovernorBravoDelegate,
  GovernorBravoDelegate__factory,
  GovernorBravoDelegator,
} from "../../../../../typechain";

export async function getProposalId(
  world: World,
  governor: GovernorBravoDelegate,
  proposalIdent: Event
): Promise<number> {
  if (typeof proposalIdent === "string" && proposalIdent === "LastProposal") {
    return Number(await governor.callStatic.proposalCount());
  } else if (
    Array.isArray(proposalIdent) &&
    proposalIdent[0] === "ActiveProposal" &&
    typeof proposalIdent[1] === "string"
  ) {
    let proposer = getAddress(world, proposalIdent[1]);

    return Number(await governor.callStatic.latestProposalIds(proposer));
  } else {
    try {
      return (await getNumberV(world, proposalIdent)).toNumber();
    } catch (e) {
      throw new Error(
        `Unknown proposal identifier \`${proposalIdent}\`, expected Number or "LastProposal"`
      );
    }
  }
}

type GovernorBravo = GovernorBravoDelegate | GovernorBravoDelegator;

export const proposalStateEnums = {
  0: "Pending",
  1: "Active",
  2: "Canceled",
  3: "Defeated",
  4: "Succeeded",
  5: "Queued",
  6: "Expired",
  7: "Executed",
};

async function getProposal(
  world: World,
  governor: GovernorBravo,
  proposalIdent: Event,
  getter: (
    govener: GovernorBravoDelegate,
    number: encodedNumber
  ) => Promise<Event>
): Promise<Event> {
  const governorBravo = GovernorBravoDelegate__factory.connect(
    governor.address,
    world.hre.ethers.provider
  );
  return await getter(
    governorBravo,
    new NumberV(
      await getProposalId(world, governorBravo, proposalIdent)
    ).encode()
  );
}

async function getProposalState(
  world: World,
  governor: GovernorBravo,
  proposalIdent: Event
): Promise<StringV> {
  const governorBravo = GovernorBravoDelegate__factory.connect(
    governor.address,
    world.hre.ethers.provider
  );
  const proposalId = await getProposalId(world, governorBravo, proposalIdent);
  const stateEnum = await governorBravo.callStatic.state(proposalId);
  return new StringV(proposalStateEnums[stateEnum]);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function proposalFetchers(governor: GovernorBravoDelegate) {
  const fields = {
    id: getNumberV,
    proposer: getAddressV,
    eta: getNumberV,
    targets: {
      constructor: getArrayV(getStringV),
      getter: async (governor, proposalId) =>
        (await governor.callStatic.getActions(proposalId))[0],
    },
    values: {
      constructor: getArrayV(getNumberV),
      getter: async (governor, proposalId) =>
        (await governor.callStatic.getActions(proposalId))[1],
    },
    signatures: {
      constructor: getArrayV(getStringV),
      getter: async (governor, proposalId) =>
        (await governor.callStatic.getActions(proposalId))[2],
    },
    calldatas: {
      constructor: getArrayV(getStringV),
      getter: async (governor, proposalId) =>
        (await governor.callStatic.getActions(proposalId))[3],
    },
    startBlock: getNumberV,
    endBlock: getNumberV,
    forVotes: getNumberV,
    againstVotes: getNumberV,
    abstainVotes: getNumberV,
  };

  const defaultedFields = Object.entries(fields).map(([field, values]) => {
    let givenValues;

    if (typeof values === "object") {
      givenValues = values;
    } else {
      givenValues = {
        constructor: values,
      };
    }

    return {
      field: field,
      event: capitalize(field.toString()),
      getter: async (governor, proposalId) =>
        (await governor.callStatic.proposals(proposalId))[field],
      constructor: values,
      name: field.toString(),
      ...givenValues,
    };
  });

  const baseFetchers = <Fetcher<object, Value>[]>defaultedFields.map(
    ({ field, constructor, event, name, getter }) => {
      return new Fetcher<{ proposalIdent: EventV }, Value>(
        `
        #### ${event}

        * "GovernorBravo <Governor> Proposal <Proposal> ${event}" - Returns the ${
          name || field
        } of given proposal
        * E.g. "GovernorBravo GovernorBravoScenario Proposal 5 ${event}"
        * E.g. "GovernorBravo GovernorBravoScenario Proposal LastProposal ${event}"
      `,
        event,
        [new Arg("proposalIdent", getEventV)],
        async (world, { proposalIdent }) => {
          return await constructor(
            world,
            await getProposal(world, governor, proposalIdent.val, getter)
          );
        },
        { namePos: 1 }
      );
    }
  );

  const otherFetchers = <Fetcher<object, Value>[]>[
    new Fetcher<{ proposalIdent: EventV; voter: AddressV }, BoolV>(
      `
        #### HasVoted

        * "GovernorBravo <Governor> Proposal <Proposal> HasVoted <voter>" - Returns true if the given address has voted on given proposal
        * E.g. "GovernorBravo GovernorBravoScenario Proposal 5 HasVoted Geoff"
        * E.g. "GovernorBravo GovernorBravoScenario Proposal LastProposal HasVoted Geoff"
      `,
      "HasVoted",
      [new Arg("proposalIdent", getEventV), new Arg("voter", getAddressV)],
      async (world, { proposalIdent, voter }) => {
        const receipt = await governor.callStatic.getReceipt(
          await getProposalId(world, governor, proposalIdent.val),
          voter.val
        );
        return new BoolV(receipt.hasVoted);
      },
      { namePos: 1 }
    ),
    new Fetcher<{ proposalIdent: EventV; voter: AddressV }, NumberV>(
      `
        #### Support

        * "GovernorBravo <Governor> Proposal <Proposal> Support <voter>" - Returns support value for voter (0 against, 1 for, 2 abstain)
        * E.g. "GovernorBravo GovernorBravoScenario Proposal 5 Support Geoff"
        * E.g. "GovernorBravo GovernorBravoScenario Proposal LastProposal Support Geoff"
      `,
      "Support",
      [new Arg("proposalIdent", getEventV), new Arg("voter", getAddressV)],
      async (world, { proposalIdent, voter }) => {
        const receipt = await governor.callStatic.getReceipt(
          await getProposalId(world, governor, proposalIdent.val),
          voter.val
        );
        return new NumberV(receipt.support);
      },
      { namePos: 1 }
    ),
    new Fetcher<{ proposalIdent: EventV; voter: AddressV }, NumberV>(
      `
        #### VotesCast

        * "GovernorBravo <Governor> Proposal <Proposal> VotesCast <voter>" - Returns true if the given address has voted on given proposal
        * E.g. "GovernorBravo GovernorBravoScenario Proposal 5 VotesCast Geoff"
        * E.g. "GovernorBravo GovernorBravoScenario Proposal LastProposal VotesCast Geoff"
      `,
      "VotesCast",
      [new Arg("proposalIdent", getEventV), new Arg("voter", getAddressV)],
      async (world, { proposalIdent, voter }) => {
        const receipt = await governor.callStatic.getReceipt(
          await getProposalId(world, governor, proposalIdent.val),
          voter.val
        );
        return new NumberV(receipt.votes.toString());
      },
      { namePos: 1 }
    ),
    new Fetcher<{ proposalIdent: EventV }, StringV>(
      `
        #### State

        * "GovernorBravo <Governor> Proposal <Proposal> State" - Returns a string of a proposal's current state
        * E.g. "GovernorBravo GovernorBravoScenario Proposal LastProposal State"
      `,
      "State",
      [new Arg("proposalIdent", getEventV)],
      async (world, { proposalIdent }) => {
        return await getProposalState(world, governor, proposalIdent.val);
      },
      { namePos: 1 }
    ),
  ];

  return baseFetchers.concat(otherFetchers);
}

export async function getProposalValue(
  world: World,
  governor: GovernorBravoDelegate,
  event: Event
): Promise<Value> {
  return await getFetcherValue<any, any>(
    "Proposal",
    proposalFetchers(governor),
    world,
    event
  );
}
