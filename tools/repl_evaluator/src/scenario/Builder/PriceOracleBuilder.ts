import { Event } from "../Event";
import { addAction, World } from "../World";
import { Invokation, invoke } from "../Invokation";
import { getAddressV, getExpNumberV, getStringV } from "../CoreValue";
import { AddressV, EventV, NothingV, NumberV, StringV } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import {
  deploy_contract_world,
  getContract,
  getTestContract,
} from "../Contract";
import {
  FixedPriceOracle,
  IUniswapAnchoredView,
  PriceOracle,
  PriceOracle__factory,
  SimplePriceOracle,
  V1PriceOracleInterface__factory,
} from "../../../../../typechain";
import { PriceOracleInterface } from "../../../../../typechain/PriceOracle";

export interface PriceOracleData {
  invokation?: Invokation<PriceOracle>;
  contract?: PriceOracle;
  description: string;
  address?: string;
}

export async function buildPriceOracle(
  world: World,
  from: string,
  event: Event
): Promise<{
  world: World;
  priceOracle: PriceOracle;
  priceOracleData: PriceOracleData;
}> {
  const fetchers = [
    new Fetcher<{ price: NumberV }, PriceOracleData>(
      `
        #### Fixed

        * "Fixed price:<Exp>" - Fixed price
          * E.g. "PriceOracle Deploy (Fixed 20.0)"
      `,
      "Fixed",
      [new Arg("price", getExpNumberV)],
      async (world, { price }) => {
        return {
          invokation: await deploy_contract_world<FixedPriceOracle>(
            world,
            from,
            "FixedPriceOracle",
            [price.val]
          ),
          description: "Fixed Price Oracle",
        };
      }
    ),
    new Fetcher<{}, PriceOracleData>(
      `
        #### Simple

        * "Simple" - The a simple price oracle that has a harness price setter
          * E.g. "PriceOracle Deploy Simple"
      `,
      "Simple",
      [],
      async (world, {}) => {
        return {
          invokation: await deploy_contract_world<SimplePriceOracle>(
            world,
            from,
            "SimplePriceOracle",
            []
          ),
          description: "Simple Price Oracle",
        };
      }
    ),
    //new Fetcher<{ poster: AddressV }, PriceOracleData>(
    //  `
    //    #### Anchor

    //    * "Anchor <poster:Address>" - The anchor price oracle that caps price movements to anchors
    //      * E.g. "PriceOracle Deploy Anchor 0x..."
    //  `,
    //  "Anchor",
    //  [new Arg("poster", getAddressV)],
    //  async (world, { poster }) => {
    //    return {
    //      invokation: await deploy_contract_world<AnchorOracle>(world, from, "AnchorOracle",[
    //        poster.val,
    //      ]),
    //      description: "Anchor Price Oracle",
    //      poster: poster.val,
    //    };
    //  }
    //),
    // new Fetcher<{}, PriceOracleData>(
    //   `
    //     #### NotPriceOracle

    //     * "NotPriceOracle" - Not actually a price oracle
    //       * E.g. "PriceOracle Deploy NotPriceOracle"
    //   `,
    //   "NotPriceOracle",
    //   [],
    //   async (world, {}) => {
    //     return {
    //       invokation: await deploy_contract_world<NotPriceOracle>(
    //         world,
    //         from,
    //         "NotPriceOracle",
    //         []
    //       ),
    //       description: "Not a Price Oracle",
    //     };
    //   }
    // ),
  ];

  let priceOracleData = await getFetcherValue<any, PriceOracleData>(
    "DeployPriceOracle",
    fetchers,
    world,
    event
  );
  let invokation = priceOracleData.invokation!;
  delete priceOracleData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }
  const priceOracle = invokation.value!;
  priceOracleData.address = priceOracle.address;

  world = await storeAndSaveContract(
    world,
    priceOracle,
    "PriceOracle",
    invokation,
    [{ index: ["PriceOracle"], data: priceOracleData }]
  );

  return { world, priceOracle, priceOracleData };
}

export async function setPriceOracle(
  world: World,
  event: Event
): Promise<{
  world: World;
  priceOracle: PriceOracle;
  priceOracleData: PriceOracleData;
}> {
  const fetchers = [
    new Fetcher<{ address: AddressV; description: StringV }, PriceOracleData>(
      `
        #### Standard

        * "Standard" - The standard price oracle
          * E.g. "PriceOracle Set Standard \"0x...\" \"Standard Price Oracle\""
      `,
      "Standard",
      [new Arg("address", getAddressV), new Arg("description", getStringV)],
      async (world, { address, description }) => {
        const standard = PriceOracle__factory.connect(
          address.val,
          world.hre.ethers.provider
        );
        return {
          contract: standard,
          description: description.val,
        };
      }
    ),
  ];

  let priceOracleData = await getFetcherValue<any, PriceOracleData>(
    "SetPriceOracle",
    fetchers,
    world,
    event
  );
  let priceOracle = priceOracleData.contract!;
  delete priceOracleData.contract;

  priceOracleData.address = priceOracle.address;

  world = await storeAndSaveContract(world, priceOracle, "PriceOracle", null, [
    { index: ["PriceOracle"], data: priceOracleData },
  ]);

  return { world, priceOracle, priceOracleData };
}
