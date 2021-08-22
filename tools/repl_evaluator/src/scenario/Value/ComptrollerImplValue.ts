import { Event } from "../Event";
import { World } from "../World";
import { AddressV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { getComptrollerImpl } from "../ContractLookup";
import { ComptrollerImplS } from "../Event/ComptrollerEvent";

export async function getComptrollerImplAddress(
  _world: World,
  comptrollerImpl: ComptrollerImplS
): Promise<AddressV> {
  return new AddressV(comptrollerImpl.address);
}

export function comptrollerImplFetchers() {
  return [
    new Fetcher<{ comptrollerImpl: ComptrollerImplS }, AddressV>(
      `
        #### Address

        * "ComptrollerImpl Address" - Returns address of comptroller implementation
      `,
      "Address",
      [new Arg("comptrollerImpl", getComptrollerImpl)],
      (world, { comptrollerImpl }) =>
        getComptrollerImplAddress(world, comptrollerImpl),
      { namePos: 1 }
    ),
  ];
}

export async function getComptrollerImplValue(
  world: World,
  event: Event
): Promise<Value> {
  return await getFetcherValue<any, any>(
    "ComptrollerImpl",
    comptrollerImplFetchers(),
    world,
    event
  );
}
