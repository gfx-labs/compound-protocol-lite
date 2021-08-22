import { Event } from "../Event";
import { World } from "../World";
import { Invokation } from "../Invokation";
import { getStringV } from "../CoreValue";
import { AddressV, NumberV, StringV } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import { deploy_contract_world } from "../Contract";
import {
  CDaiDelegate,
  CDaiDelegateScenario,
  CErc20Delegate,
  CErc20DelegateScenario,
} from "../../../../../typechain";

export interface CTokenDelegateData {
  invokation: Invokation<CErc20Delegate>;
  name: string;
  contract: string;
  description?: string;
}

export async function buildCTokenDelegate(
  world: World,
  from: string,
  params: Event
): Promise<{
  world: World;
  cTokenDelegate: CErc20Delegate;
  delegateData: CTokenDelegateData;
}> {
  const fetchers = [
    new Fetcher<{ name: StringV }, CTokenDelegateData>(
      `
        #### CDaiDelegate

        * "CDaiDelegate name:<String>"
          * E.g. "CTokenDelegate Deploy CDaiDelegate cDAIDelegate"
      `,
      "CDaiDelegate",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<CDaiDelegate>(
            world,
            from,
            "CDaiDelegate",
            []
          ),
          name: name.val,
          contract: "CDaiDelegate",
          description: "Standard CDai Delegate",
        };
      }
    ),

    new Fetcher<{ name: StringV }, CTokenDelegateData>(
      `
        #### CDaiDelegateScenario

        * "CDaiDelegateScenario name:<String>" - A CDaiDelegate Scenario for local testing
          * E.g. "CTokenDelegate Deploy CDaiDelegateScenario cDAIDelegate"
      `,
      "CDaiDelegateScenario",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<CDaiDelegateScenario>(
            world,
            from,
            "CDaiDelegateScenario",
            []
          ),
          name: name.val,
          contract: "CDaiDelegateScenario",
          description: "Scenario CDai Delegate",
        };
      }
    ),

    new Fetcher<{ name: StringV }, CTokenDelegateData>(
      `
        #### CErc20Delegate

        * "CErc20Delegate name:<String>"
          * E.g. "CTokenDelegate Deploy CErc20Delegate cDAIDelegate"
      `,
      "CErc20Delegate",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<CErc20Delegate>(
            world,
            from,
            "CErc20Delegate",
            []
          ),
          name: name.val,
          contract: "CErc20Delegate",
          description: "Standard CErc20 Delegate",
        };
      }
    ),

    new Fetcher<{ name: StringV }, CTokenDelegateData>(
      `
        #### CErc20DelegateScenario

        * "CErc20DelegateScenario name:<String>" - A CErc20Delegate Scenario for local testing
          * E.g. "CTokenDelegate Deploy CErc20DelegateScenario cDAIDelegate"
      `,
      "CErc20DelegateScenario",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<CErc20DelegateScenario>(
            world,
            from,
            "CErc20DelegateScenario",
            []
          ),
          name: name.val,
          contract: "CErc20DelegateScenario",
          description: "Scenario CErc20 Delegate",
        };
      }
    ),
  ];

  let delegateData = await getFetcherValue<any, CTokenDelegateData>(
    "DeployCToken",
    fetchers,
    world,
    params
  );
  let invokation = delegateData.invokation;
  delete delegateData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }

  const cTokenDelegate = invokation.value!;

  world = await storeAndSaveContract(
    world,
    cTokenDelegate,
    delegateData.name,
    invokation,
    [
      {
        index: ["CTokenDelegate", delegateData.name],
        data: {
          address: cTokenDelegate.address,
          contract: delegateData.contract,
          description: delegateData.description,
        },
      },
    ]
  );

  return { world, cTokenDelegate, delegateData };
}
