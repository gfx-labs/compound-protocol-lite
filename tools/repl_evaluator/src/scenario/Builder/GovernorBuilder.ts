import { Event } from "../Event";
import { World } from "../World";
import { Invokation } from "../Invokation";
import { getAddressV, getStringV } from "../CoreValue";
import { AddressV, StringV } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import { deploy_contract_world } from "../Contract";
import { GovernorAlpha, GovernorAlphaHarness } from "../../../../../typechain";

export interface GovernorData {
  invokation: Invokation<GovernorAlpha | GovernorAlphaHarness>;
  name: string;
  contract: string;
  address?: string;
}

export async function buildGovernor(
  world: World,
  from: string,
  params: Event
): Promise<{
  world: World;
  governor: GovernorAlpha | GovernorAlphaHarness;
  govData: GovernorData;
}> {
  const fetchers = [
    new Fetcher<
      { name: StringV; timelock: AddressV; comp: AddressV; guardian: AddressV },
      GovernorData
    >(
      `
      #### GovernorAlpha

      * "Governor Deploy Alpha name:<String> timelock:<Address> comp:<Address> guardian:<Address>" - Deploys Compound Governor Alpha
        * E.g. "Governor Deploy Alpha GovernorAlpha (Address Timelock) (Address Comp) Guardian"
    `,
      "Alpha",
      [
        new Arg("name", getStringV),
        new Arg("timelock", getAddressV),
        new Arg("comp", getAddressV),
        new Arg("guardian", getAddressV),
      ],
      async (world, { name, timelock, comp, guardian }) => {
        return {
          invokation: await deploy_contract_world<GovernorAlpha>(
            world,
            from,
            "GovernorAlpha",
            [timelock.val, comp.val, guardian.val]
          ),
          name: name.val,
          contract: "GovernorAlpha",
        };
      }
    ),
    new Fetcher<
      { name: StringV; timelock: AddressV; comp: AddressV; guardian: AddressV },
      GovernorData
    >(
      `
      #### GovernorAlphaHarness

      * "Governor Deploy AlphaHarness name:<String> timelock:<Address> comp:<Address> guardian:<Address>" - Deploys Compound Governor Alpha with a mocked voting period
        * E.g. "Governor Deploy AlphaHarness GovernorAlphaHarness (Address Timelock) (Address Comp) Guardian"
    `,
      "AlphaHarness",
      [
        new Arg("name", getStringV),
        new Arg("timelock", getAddressV),
        new Arg("comp", getAddressV),
        new Arg("guardian", getAddressV),
      ],
      async (world, { name, timelock, comp, guardian }) => {
        return {
          invokation: await deploy_contract_world<GovernorAlphaHarness>(
            world,
            from,
            "GovernorAlphaHarness",
            [timelock.val, comp.val, guardian.val]
          ),
          name: name.val,
          contract: "GovernorAlphaHarness",
        };
      }
    ),
  ];

  let govData = await getFetcherValue<any, GovernorData>(
    "DeployGovernor",
    fetchers,
    world,
    params
  );
  let invokation = govData.invokation;
  delete govData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }

  const governor = invokation.value!;
  govData.address = governor.address;

  world = await storeAndSaveContract(
    world,
    governor,
    govData.name,
    invokation,
    [{ index: ["Governor", govData.name], data: govData }]
  );

  return { world, governor, govData };
}
