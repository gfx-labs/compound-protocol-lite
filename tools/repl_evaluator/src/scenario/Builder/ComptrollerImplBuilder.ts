import { Event } from "../Event";
import { World } from "../World";

import {
  Comptroller,
  ComptrollerG1,
  ComptrollerG2,
  ComptrollerG3,
  ComptrollerG4,
  ComptrollerG5,
  ComptrollerG6,
  ComptrollerG7,
  ComptrollerScenario,
  ComptrollerScenarioG1,
  ComptrollerScenarioG2,
  ComptrollerScenarioG3,
  ComptrollerScenarioG4,
  ComptrollerScenarioG5,
  ComptrollerScenarioG6,
  ComptrollerBorked,
} from "../../../../../typechain";
import { Invokation } from "../Invokation";
import { getStringV } from "../CoreValue";
import { StringV } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import { deploy_contract_world } from "../Contract";

export type ComptrollerImplBorkable =
  | Comptroller
  | ComptrollerG1
  | ComptrollerG2
  | ComptrollerG3
  | ComptrollerG4
  | ComptrollerG5
  | ComptrollerG6
  | ComptrollerG7
  | ComptrollerBorked;

export type ComptrollerImpl =
  | Comptroller
  | ComptrollerG1
  | ComptrollerG2
  | ComptrollerG3
  | ComptrollerG4
  | ComptrollerG5
  | ComptrollerG6
  | ComptrollerG7;

export type ComptrollerScenarioImpl =
  | ComptrollerScenario
  | ComptrollerScenarioG1
  | ComptrollerScenarioG2
  | ComptrollerScenarioG3
  | ComptrollerScenarioG4
  | ComptrollerScenarioG5
  | ComptrollerScenarioG6;

export interface ComptrollerImplData<T extends ComptrollerImplBorkable> {
  invokation: Invokation<T>;
  name: string;
  contract: string;
  description: string;
}

export async function buildComptrollerImpl<T extends ComptrollerImplBorkable>(
  world: World,
  from: string,
  event: Event
): Promise<{
  world: World;
  comptrollerImpl: T;
  comptrollerImplData: ComptrollerImplData<T>;
}> {
  const fetchers: Array<Fetcher<any, ComptrollerImplData<any>>> = [
    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerScenarioG1>>(
      `
        #### ScenarioG1

        * "ScenarioG1 name:<String>" - The Comptroller Scenario for local testing (G1)
          * E.g. "ComptrollerImplBorkable Deploy ScenarioG1 MyScen"
      `,
      "ScenarioG1",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerScenarioG1>(
          world,
          from,
          "ComptrollerScenarioG1",
          []
        ),
        name: name.val,
        contract: "ComptrollerScenarioG1",
        description: "ScenarioG1 Comptroller Impl",
      })
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerScenarioG2>>(
      `
        #### ScenarioG2

        * "ScenarioG2 name:<String>" - The Comptroller Scenario for local testing (G2)
          * E.g. "ComptrollerImplBorkable Deploy ScenarioG2 MyScen"
      `,
      "ScenarioG2",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerScenarioG2>(
          world,
          from,
          "ComptrollerScenarioG2",
          []
        ),
        name: name.val,
        contract: "ComptrollerScenarioG2Contract",
        description: "ScenarioG2 Comptroller Impl",
      })
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerScenarioG3>>(
      `
        #### ScenarioG3

        * "ScenarioG3 name:<String>" - The Comptroller Scenario for local testing (G3)
          * E.g. "ComptrollerImplBorkable Deploy ScenarioG3 MyScen"
      `,
      "ScenarioG3",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerScenarioG3>(
          world,
          from,
          "ComptrollerScenarioG3",
          []
        ),
        name: name.val,
        contract: "ComptrollerScenarioG3Contract",
        description: "ScenarioG3 Comptroller Impl",
      })
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerScenarioG4>>(
      `
        #### ScenarioG4
        * "ScenarioG4 name:<String>" - The Comptroller Scenario for local testing (G4)
          * E.g. "ComptrollerImplBorkable Deploy ScenarioG4 MyScen"
      `,
      "ScenarioG4",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerScenarioG4>(
          world,
          from,
          "ComptrollerScenarioG4",
          []
        ),
        name: name.val,
        contract: "ComptrollerScenarioG4Contract",
        description: "ScenarioG4 Comptroller Impl",
      })
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerScenarioG5>>(
      `
        #### ScenarioG5
        * "ScenarioG5 name:<String>" - The Comptroller Scenario for local testing (G5)
          * E.g. "ComptrollerImplBorkable Deploy ScenarioG5 MyScen"
      `,
      "ScenarioG5",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerScenarioG5>(
          world,
          from,
          "ComptrollerScenarioG5",
          []
        ),
        name: name.val,
        contract: "ComptrollerScenarioG5Contract",
        description: "ScenarioG5 Comptroller Impl",
      })
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerScenarioG6>>(
      `
        #### ScenarioG6
        * "ScenarioG6 name:<String>" - The Comptroller Scenario for local testing (G6)
          * E.g. "ComptrollerImplBorkable Deploy ScenarioG6 MyScen"
      `,
      "ScenarioG6",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerScenarioG6>(
          world,
          from,
          "ComptrollerScenarioG6",
          []
        ),
        name: name.val,
        contract: "ComptrollerScenarioG6Contract",
        description: "ScenarioG6 Comptroller Impl",
      })
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerScenario>>(
      `
        #### Scenario

        * "Scenario name:<String>" - The Comptroller Scenario for local testing
          * E.g. "ComptrollerImplBorkable Deploy Scenario MyScen"
      `,
      "Scenario",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerScenario>(
          world,
          from,
          "ComptrollerScenario",
          []
        ),
        name: name.val,
        contract: "ComptrollerScenario",
        description: "Scenario Comptroller Impl",
      })
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerG1>>(
      `
        #### StandardG1

        * "StandardG1 name:<String>" - The standard generation 1 Comptroller contract
          * E.g. "Comptroller Deploy StandardG1 MyStandard"
      `,
      "StandardG1",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<ComptrollerG1>(
            world,
            from,
            "ComptrollerG1",
            []
          ),
          name: name.val,
          contract: "ComptrollerG1",
          description: "StandardG1 Comptroller Impl",
        };
      }
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerG2>>(
      `
        #### StandardG2

        * "StandardG2 name:<String>" - The standard generation 2 Comptroller contract
          * E.g. "Comptroller Deploy StandardG2 MyStandard"
      `,
      "StandardG2",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<ComptrollerG2>(
            world,
            from,
            "ComptrollerG2",
            []
          ),
          name: name.val,
          contract: "ComptrollerG2",
          description: "StandardG2 Comptroller Impl",
        };
      }
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerG3>>(
      `
        #### StandardG3

        * "StandardG3 name:<String>" - The standard generation 3 Comptroller contract
          * E.g. "Comptroller Deploy StandardG3 MyStandard"
      `,
      "StandardG3",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<ComptrollerG3>(
            world,
            from,
            "ComptrollerG3",
            []
          ),
          name: name.val,
          contract: "ComptrollerG3",
          description: "StandardG3 Comptroller Impl",
        };
      }
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerG4>>(
      `
        #### StandardG4

        * "StandardG4 name:<String>" - The standard generation 4 Comptroller contract
          * E.g. "Comptroller Deploy StandardG4 MyStandard"
      `,
      "StandardG4",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<ComptrollerG4>(
            world,
            from,
            "ComptrollerG4",
            []
          ),
          name: name.val,
          contract: "ComptrollerG4",
          description: "StandardG4 Comptroller Impl",
        };
      }
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerG5>>(
      `
        #### StandardG5
        * "StandardG5 name:<String>" - The standard generation 5 Comptroller contract
          * E.g. "Comptroller Deploy StandardG5 MyStandard"
      `,
      "StandardG5",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<ComptrollerG5>(
            world,
            from,
            "ComptrollerG5",
            []
          ),
          name: name.val,
          contract: "ComptrollerG5",
          description: "StandardG5 Comptroller Impl",
        };
      }
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerG6>>(
      `
        #### StandardG6
        * "StandardG6 name:<String>" - The standard generation 6 Comptroller contract
          * E.g. "Comptroller Deploy StandardG6 MyStandard"
      `,
      "StandardG6",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<ComptrollerG6>(
            world,
            from,
            "ComptrollerG6",
            []
          ),
          name: name.val,
          contract: "ComptrollerG6",
          description: "StandardG6 Comptroller Impl",
        };
      }
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerG7>>(
      `
        #### Standard

        * "Standard name:<String>" - The standard Comptroller contract
          * E.g. "Comptroller Deploy Standard MyStandard"
      `,
      "Standard",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        return {
          invokation: await deploy_contract_world<Comptroller>(
            world,
            from,
            "Comptroller",
            []
          ),
          name: name.val,
          contract: "Comptroller",
          description: "Standard Comptroller Impl",
        };
      }
    ),

    new Fetcher<{ name: StringV }, ComptrollerImplData<ComptrollerBorked>>(
      `
        #### Borked

        * "Borked name:<String>" - A Borked Comptroller for testing
          * E.g. "ComptrollerImplBorkable Deploy Borked MyBork"
      `,
      "Borked",
      [new Arg("name", getStringV)],
      async (world, { name }) => ({
        invokation: await deploy_contract_world<ComptrollerBorked>(
          world,
          from,
          "ComptrollerBorked",
          []
        ),
        name: name.val,
        contract: "ComptrollerBorked",
        description: "Borked Comptroller Impl",
      })
    ),
    new Fetcher<{ name: StringV }, ComptrollerImplData<Comptroller>>(
      `
        #### Default

        * "name:<String>" - The standard Comptroller contract
          * E.g. "ComptrollerImplBorkable Deploy MyDefault"
      `,
      "Default",
      [new Arg("name", getStringV)],
      async (world, { name }) => {
        if (world.isLocalNetwork()) {
          // Note: we're going to use the scenario contract as the standard deployment on local networks
          return {
            invokation: await deploy_contract_world<ComptrollerScenario>(
              world,
              from,
              "ComptrollerScenario",
              []
            ),
            name: name.val,
            contract: "ComptrollerScenario",
            description: "Scenario Comptroller Impl",
          };
        } else {
          return {
            invokation: await deploy_contract_world<Comptroller>(
              world,
              from,
              "Comptroller",
              []
            ),
            name: name.val,
            contract: "Comptroller",
            description: "Standard Comptroller Impl",
          };
        }
      },
      { catchall: true }
    ),
  ];

  let comptrollerImplData = await getFetcherValue<any, ComptrollerImplData<T>>(
    "DeployComptrollerImplBorkable",
    fetchers,
    world,
    event
  );
  let invokation = comptrollerImplData.invokation;
  delete comptrollerImplData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }
  const comptrollerImpl = invokation.value!;

  world = await storeAndSaveContract(
    world,
    comptrollerImpl,
    comptrollerImplData.name,
    invokation,
    [
      {
        index: ["Comptroller", comptrollerImplData.name],
        data: {
          address: comptrollerImpl.address,
          contract: comptrollerImplData.contract,
          description: comptrollerImplData.description,
        },
      },
    ]
  );

  return { world, comptrollerImpl, comptrollerImplData };
}
