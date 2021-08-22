import { Event } from "../Event";
import { World } from "../World";
import { Maximillion } from "../../../../../typechain/Maximillion";
import { AddressV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { getMaximillion } from "../ContractLookup";

export async function getMaximillionAddress(
  _world: World,
  maximillion: Maximillion
): Promise<AddressV> {
  return new AddressV(maximillion.address);
}

export function maximillionFetchers() {
  return [
    new Fetcher<{ maximillion: Maximillion }, AddressV>(
      `
        #### Address

        * "Maximillion Address" - Returns address of maximillion
      `,
      "Address",
      [new Arg("maximillion", getMaximillion, { implicit: true })],
      (world, { maximillion }) => getMaximillionAddress(world, maximillion)
    ),
  ];
}

export async function getMaximillionValue(
  world: World,
  event: Event
): Promise<Value> {
  return await getFetcherValue<any, any>(
    "Maximillion",
    maximillionFetchers(),
    world,
    event
  );
}
