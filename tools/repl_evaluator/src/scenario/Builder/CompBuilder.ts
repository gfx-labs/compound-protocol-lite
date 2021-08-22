import { Event } from "../Event";
import { World, addAction } from "../World";
import { Comp, CompScenario } from "../../../../../typechain";
import { Invokation } from "../Invokation";
import { getAddressV } from "../CoreValue";
import { StringV, AddressV } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import { deploy_contract_world, getContract } from "../Contract";

export interface TokenData {
  invokation: Invokation<Comp>;
  contract: string;
  address?: string;
  symbol: string;
  name: string;
  decimals?: number;
}

export async function buildComp(
  world: World,
  from: string,
  params: Event
): Promise<{ world: World; comp: Comp; tokenData: TokenData }> {
  const fetchers = [
    new Fetcher<{ account: AddressV }, TokenData>(
      `
      #### Scenario

      * "Comp Deploy Scenario account:<Address>" - Deploys Scenario Comp Token
        * E.g. "Comp Deploy Scenario Geoff"
    `,
      "Scenario",
      [new Arg("account", getAddressV)],
      async (world, { account }) => {
        return {
          invokation: await deploy_contract_world<CompScenario>(
            world,
            from,
            "CompScenario",
            [account.val]
          ),
          contract: "CompScenario",
          symbol: "COMP",
          name: "Compound Governance Token",
          decimals: 18,
        };
      }
    ),

    new Fetcher<{ account: AddressV }, TokenData>(
      `
      #### Comp

      * "Comp Deploy account:<Address>" - Deploys Comp Token
        * E.g. "Comp Deploy Geoff"
    `,
      "Comp",
      [new Arg("account", getAddressV)],
      async (world, { account }) => {
        if (world.isLocalNetwork()) {
          return {
            invokation: await deploy_contract_world<CompScenario>(
              world,
              from,
              "CompScenario",
              [account.val]
            ),
            contract: "CompScenario",
            symbol: "COMP",
            name: "Compound Governance Token",
            decimals: 18,
          };
        } else {
          return {
            invokation: await deploy_contract_world<Comp>(world, from, "Comp", [
              account.val,
            ]),
            contract: "Comp",
            symbol: "COMP",
            name: "Compound Governance Token",
            decimals: 18,
          };
        }
      },
      { catchall: true }
    ),
  ];

  let tokenData = await getFetcherValue<any, TokenData>(
    "DeployComp",
    fetchers,
    world,
    params
  );
  let invokation = tokenData.invokation;
  delete tokenData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }

  const comp = invokation.value!;
  tokenData.address = comp.address;

  world = await storeAndSaveContract(world, comp, "Comp", invokation, [
    { index: ["Comp"], data: tokenData },
    { index: ["Tokens", tokenData.symbol], data: tokenData },
  ]);

  tokenData.invokation = invokation;

  return { world, comp, tokenData };
}
