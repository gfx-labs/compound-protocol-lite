import { Event } from "../Event";
import { addAction, describeUser, World } from "../World";
import {
  GovernorAlpha,
  GovernorBravoDelegate,
  GovernorBravoDelegator,
} from "../../../../../typechain";
import { invoke } from "../Invokation";
import { getEventV } from "../CoreValue";
import { EventV } from "../Value";
import { Arg, Command, processCommandEvent } from "../Command";
import { getProposalId } from "../Value/ProposalValue";

type Governor = GovernorAlpha | GovernorBravoDelegate | GovernorBravoDelegator;

function getSupport(support: Event): boolean {
  if (typeof support === "string") {
    if (support === "For" || support === "Against") {
      return support === "For";
    }
  }

  throw new Error(
    `Unknown support flag \`${support}\`, expected "For" or "Against"`
  );
}

async function describeProposal(
  _world: World,
  _governor: Governor,
  proposalId: number
): Promise<string> {
  // const proposal = await from,governor,await governor.populateTransaction.proposals(proposalId).call();
  return `proposal ${proposalId.toString()}`; // TODO: Cleanup
}

export function proposalCommands(governor: Governor) {
  return [
    new Command<{ proposalIdent: EventV; support: EventV }>(
      `
        #### Vote

        * "Governor <Governor> Vote <For|Against>" - Votes for or against a given proposal
        * E.g. "Governor GovernorScenario Proposal LastProposal Vote For"
    `,
      "Vote",
      [new Arg("proposalIdent", getEventV), new Arg("support", getEventV)],
      async (world, from, { proposalIdent, support }) => {
        let proposalId = await getProposalId(
          world,
          governor,
          proposalIdent.val
        );
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction["castVote(uint256,bool)"](
            proposalId,
            getSupport(support.val)
          ),
          "castVote"
        );

        return addAction(
          world,
          `Cast ${support.val.toString()} vote from ${describeUser(
            world,
            from
          )} for proposal ${proposalId}`,
          invokation
        );
      },
      { namePos: 1 }
    ),

    new Command<{ proposalIdent: EventV }>(
      `
        #### Queue
        * "Governor <Governor> Queue" - Queues given proposal
        * E.g. "Governor GovernorScenario Proposal LastProposal Queue"
    `,
      "Queue",
      [new Arg("proposalIdent", getEventV)],
      async (world, from, { proposalIdent }) => {
        const proposalId = await getProposalId(
          world,
          governor,
          proposalIdent.val
        );
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction["queue(uint256)"](proposalId),
          "queue"
        );

        return addAction(
          world,
          `Queue proposal ${await describeProposal(
            world,
            governor,
            proposalId
          )} from ${describeUser(world, from)}`,
          invokation
        );
      },
      { namePos: 1 }
    ),
    new Command<{ proposalIdent: EventV }>(
      `
        #### Execute
        * "Governor <Governor> Execute" - Executes given proposal
        * E.g. "Governor GovernorScenario Proposal LastProposal Execute"
    `,
      "Execute",
      [new Arg("proposalIdent", getEventV)],
      async (world, from, { proposalIdent }) => {
        const proposalId = await getProposalId(
          world,
          governor,
          proposalIdent.val
        );
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction["execute(uint256)"](proposalId),
          "execute"
        );

        return addAction(
          world,
          `Execute proposal ${await describeProposal(
            world,
            governor,
            proposalId
          )} from ${describeUser(world, from)}`,
          invokation
        );
      },
      { namePos: 1 }
    ),
    new Command<{ proposalIdent: EventV }>(
      `
        #### Cancel
        * "Cancel" - cancels given proposal
        * E.g. "Governor Proposal LastProposal Cancel"
    `,
      "Cancel",
      [new Arg("proposalIdent", getEventV)],
      async (world, from, { proposalIdent }) => {
        const proposalId = await getProposalId(
          world,
          governor,
          proposalIdent.val
        );
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction["cancel(uint256)"](proposalId),
          "cancel"
        );

        return addAction(
          world,
          `Cancel proposal ${await describeProposal(
            world,
            governor,
            proposalId
          )} from ${describeUser(world, from)}`,
          invokation
        );
      },
      { namePos: 1 }
    ),
  ];
}

export async function processProposalEvent(
  world: World,
  governor: Governor,
  event: Event,
  from: string | null
): Promise<World> {
  return await processCommandEvent<any>(
    "Proposal",
    proposalCommands(governor),
    world,
    event,
    from
  );
}
