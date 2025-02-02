import { Event } from "../Event";
import { addAction, describeUser, World } from "../World";
import { invoke } from "../Invokation";
import {
  getAddressV,
  getEventV,
  getNumberV,
  getStringV,
  getCoreValue,
} from "../CoreValue";
import { AddressV, EventV, NumberV, StringV } from "../Value";
import { Arg, Command, processCommandEvent, View } from "../Command";
import {
  GovernorAlpha,
  GovernorAlphaHarness,
  GovernorAlphaHarness__factory,
} from "../../../../../typechain";

export function guardianCommands(governor: GovernorAlphaHarness) {
  return [
    new Command<{ newPendingAdmin: AddressV; eta: NumberV }>(
      `
        #### QueueSetTimelockPendingAdmin

        * "Governor <Governor> QueueSetTimelockPendingAdmin newPendingAdmin:<Address> eta:<Number>" - Queues in the timelock a function to set a new pending admin
        * E.g. "Governor GovernorScenario Guardian QueueSetTimelockPendingAdmin Geoff 604900"
    `,
      "QueueSetTimelockPendingAdmin",
      [new Arg("newPendingAdmin", getAddressV), new Arg("eta", getNumberV)],
      async (world, from, { newPendingAdmin, eta }) => {
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction.__queueSetTimelockPendingAdmin(
            newPendingAdmin.val,
            eta.encode()
          ),
          "__queueSetTimelockPendingAdmin"
        );

        return addAction(
          world,
          `Gov Guardian has queued in the timelock a new pending admin command for ${describeUser(
            world,
            newPendingAdmin.val
          )}`,
          invokation
        );
      }
    ),

    new Command<{ newPendingAdmin: AddressV; eta: NumberV }>(
      `
        #### ExecuteSetTimelockPendingAdmin

        * "Governor <Governor> ExecuteSetTimelockPendingAdmin newPendingAdmin:<Address> eta:<Number>" - Executes on the timelock the function to set a new pending admin
        * E.g. "Governor GovernorScenario Guardian ExecuteSetTimelockPendingAdmin Geoff 604900"
    `,
      "ExecuteSetTimelockPendingAdmin",
      [new Arg("newPendingAdmin", getAddressV), new Arg("eta", getNumberV)],
      async (world, from, { newPendingAdmin, eta }) => {
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction.__executeSetTimelockPendingAdmin(
            newPendingAdmin.val,
            eta.encode()
          ),
          "__executeSetTimelockPendingAdmin"
        );

        return addAction(
          world,
          `Gov Guardian has executed via the timelock a new pending admin to ${describeUser(
            world,
            newPendingAdmin.val
          )}`,
          invokation
        );
      }
    ),

    new Command<{}>(
      `
        #### AcceptAdmin

        * "Governor <Governor> Guardian AcceptAdmin" - Calls \`acceptAdmin\` on the Timelock
        * E.g. "Governor GovernorScenario Guardian AcceptAdmin"
    `,
      "AcceptAdmin",
      [],
      async (world, from, {}) => {
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction.__acceptAdmin(),
          "__acceptAdmin"
        );

        return addAction(world, `Gov Guardian has accepted admin`, invokation);
      }
    ),

    new Command<{}>(
      `
        #### Abdicate

        * "Governor <Governor> Guardian Abdicate" - Abdicates gov guardian role
        * E.g. "Governor GovernorScenario Guardian Abdicate"
    `,
      "Abdicate",
      [],
      async (world, from, {}) => {
        const invokation = await invoke(
          world,
          from,
          governor,
          await governor.populateTransaction.__abdicate(),
          "__abdicate"
        );

        return addAction(world, `Gov Guardian has abdicated`, invokation);
      }
    ),
  ];
}

export async function processGuardianEvent(
  world: World,
  governor: GovernorAlpha,
  event: Event,
  from: string | null
): Promise<World> {
  const governorAlpha = new GovernorAlphaHarness__factory().attach(
    governor.address
  );
  return await processCommandEvent<any>(
    "Guardian",
    guardianCommands(governorAlpha),
    world,
    event,
    from
  );
}
