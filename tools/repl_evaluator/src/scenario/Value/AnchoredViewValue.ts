import { Event } from "../Event";
import { World } from "../World";
import { IUniswapAnchoredView } from "../../../../../typechain/IUniswapAnchoredView";
import { getAddressV } from "../CoreValue";
import { AddressV, NumberV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { getAnchoredView } from "../ContractLookup";

export async function getAnchoredViewAddress(
  _: World,
  anchoredView: IUniswapAnchoredView
): Promise<AddressV> {
  return new AddressV(anchoredView.address);
}

async function getUnderlyingPrice(
  _: World,
  anchoredView: IUniswapAnchoredView,
  asset: string
): Promise<NumberV> {
  return new NumberV(
    (await anchoredView.callStatic.getUnderlyingPrice(asset)).toString()
  );
}

export function anchoredViewFetchers() {
  return [
    new Fetcher<
      { anchoredView: IUniswapAnchoredView; asset: AddressV },
      NumberV
    >(
      `
        #### UnderlyingPrice

        * "UnderlyingPrice asset:<Address>" - Gets the price of the given asset
      `,
      "UnderlyingPrice",
      [
        new Arg("anchoredView", getAnchoredView, { implicit: true }),
        new Arg("asset", getAddressV),
      ],
      (world, { anchoredView, asset }) =>
        getUnderlyingPrice(world, anchoredView, asset.val)
    ),
  ];
}

export async function getAnchoredViewValue(
  world: World,
  event: Event
): Promise<Value> {
  return await getFetcherValue<any, any>(
    "AnchoredView",
    anchoredViewFetchers(),
    world,
    event
  );
}
