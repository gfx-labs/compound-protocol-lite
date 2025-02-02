import { Event } from "../Event";
import { World } from "../World";
import { Invokation } from "../Invokation";
import { getAddressV, getNumberV } from "../CoreValue";
import { AddressV, NumberV } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import { Timelock, TimelockHarness } from "../../../../../typechain";
import { deploy_contract_world } from "../Contract";

export interface TimelockData {
  invokation: Invokation<Timelock>;
  contract: string;
  description: string;
  address?: string;
  admin: string;
  delay: string | number;
}

export async function buildTimelock(
  world: World,
  from: string,
  event: Event
): Promise<{ world: World; timelock: Timelock; timelockData: TimelockData }> {
  const fetchers = [
    new Fetcher<{ admin: AddressV; delay: NumberV }, TimelockData>(
      `
        #### Scenario

        * "Scenario admin:<Address> delay:<Number>" - The Timelock Scenario for local testing
          * E.g. "Timelock Deploy Scenario Geoff 604800"
      `,
      "Scenario",
      [new Arg("admin", getAddressV), new Arg("delay", getNumberV)],
      async (world, { admin, delay }) => ({
        invokation: await deploy_contract_world<TimelockHarness>(
          world,
          from,
          "TimelockScenarioContract",
          [admin.val, delay.val]
        ),
        contract: "TimelockHarness",
        description: "Scenario Timelock",
        admin: admin.val,
        delay: delay.val,
      })
    ),
    new Fetcher<{ admin: AddressV; delay: NumberV }, TimelockData>(
      `
        #### Standard

        * "Standard admin:<Address> delay:<Number>" - The standard Timelock contract
          * E.g. "Timelock Deploy Standard Geoff 604800"
      `,
      "Standard",
      [new Arg("admin", getAddressV), new Arg("delay", getNumberV)],
      async (world, { admin, delay }) => ({
        invokation: await deploy_contract_world<Timelock>(
          world,
          from,
          "Timelock",
          [admin.val, delay.val]
        ),
        contract: "Timelock",
        description: "Standard Timelock",
        admin: admin.val,
        delay: delay.val,
      })
    ),
    new Fetcher<{ admin: AddressV; delay: NumberV }, TimelockData>(
      `
        #### Test

        * "Test admin:<Address> delay:<Number>" - The a standard Timelock contract with a lower minimum delay for testing
          * E.g. "Timelock Deploy Test Geoff 120"
      `,
      "Test",
      [new Arg("admin", getAddressV), new Arg("delay", getNumberV)],
      async (world, { admin, delay }) => ({
        invokation: await deploy_contract_world<Timelock>(
          world,
          from,
          "Timelock",
          [admin.val, delay.val]
        ),
        contract: "Timelock",
        description: "Test Timelock",
        admin: admin.val,
        delay: delay.val,
      })
    ),
    new Fetcher<{ admin: AddressV; delay: NumberV }, TimelockData>(
      `
        #### Default

        * "name:<String>" - The standard Timelock contract
          * E.g. "Timelock Deploy Geoff 604800"
      `,
      "Default",
      [new Arg("admin", getAddressV), new Arg("delay", getNumberV)],
      async (world, { admin, delay }) => {
        if (world.isLocalNetwork()) {
          // Note: we're going to use the scenario contract as the standard deployment on local networks
          return {
            invokation: await deploy_contract_world<TimelockHarness>(
              world,
              from,
              "TimelockHarness",
              [(admin.val, delay.val)]
            ),
            contract: "TimelockHarness",
            description: "Scenario Timelock",
            admin: admin.val,
            delay: delay.val,
          };
        } else {
          return {
            invokation: await deploy_contract_world<Timelock>(
              world,
              from,
              "Timelock",
              [admin.val, delay.val]
            ),
            contract: "Timelock",
            description: "Standard Timelock",
            admin: admin.val,
            delay: delay.val,
          };
        }
      },
      { catchall: true }
    ),
  ];

  const timelockData = await getFetcherValue<any, TimelockData>(
    "DeployTimelock",
    fetchers,
    world,
    event
  );
  const invokation = timelockData.invokation;
  delete timelockData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }
  const timelock = invokation.value!;
  timelockData.address = timelock.address;

  world = await storeAndSaveContract(world, timelock, "Timelock", invokation, [
    {
      index: ["Timelock"],
      data: {
        address: timelock.address,
        contract: timelockData.contract,
        description: timelockData.description,
      },
    },
  ]);

  return { world, timelock, timelockData };
}
