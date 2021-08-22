import { Event } from "../Event";
import { World } from "../World";
import { Invokation } from "../Invokation";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import { deploy_contract_world } from "../Contract";
import { getAddressV } from "../CoreValue";
import { AddressV } from "../Value";
import { Maximillion } from "../../../../../typechain";

export interface MaximillionData {
  invokation: Invokation<Maximillion>;
  description: string;
  cEtherAddress: string;
  address?: string;
}

export async function buildMaximillion(
  world: World,
  from: string,
  event: Event
): Promise<{
  world: World;
  maximillion: Maximillion;
  maximillionData: MaximillionData;
}> {
  const fetchers = [
    new Fetcher<{ cEther: AddressV }, MaximillionData>(
      `
        #### Maximillion

        * "" - Maximum Eth Repays Contract
          * E.g. "Maximillion Deploy"
      `,
      "Maximillion",
      [new Arg("cEther", getAddressV)],
      async (world, { cEther }) => {
        return {
          invokation: await deploy_contract_world<Maximillion>(
            world,
            from,
            "Maximillion",
            [cEther.val]
          ),
          description: "Maximillion",
          cEtherAddress: cEther.val,
        };
      },
      { catchall: true }
    ),
  ];

  let maximillionData = await getFetcherValue<any, MaximillionData>(
    "DeployMaximillion",
    fetchers,
    world,
    event
  );
  let invokation = maximillionData.invokation;
  delete maximillionData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }
  const maximillion = invokation.value!;
  maximillionData.address = maximillion.address;

  world = await storeAndSaveContract(
    world,
    maximillion,
    "Maximillion",
    invokation,
    [{ index: ["Maximillion"], data: maximillionData }]
  );

  return { world, maximillion, maximillionData };
}
