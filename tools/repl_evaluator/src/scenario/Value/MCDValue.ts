import { Event } from "../Event";
import { World } from "../World";
import { getAddressV, getCoreValue, getStringV } from "../CoreValue";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { AddressV, NumberV, Value, StringV } from "../Value";
import { PotLike__factory, VatLike__factory } from "../../../../../typechain";

export function mcdFetchers() {
  return [
    new Fetcher<
      { potAddress: AddressV; method: StringV; args: StringV[] },
      Value
    >(
      `
        #### PotAt

        * "MCD PotAt <potAddress> <method> <args>"
          * E.g. "MCD PotAt "0xPotAddress" "pie" (CToken cDai Address)"
      `,
      "PotAt",
      [
        new Arg("potAddress", getAddressV),
        new Arg("method", getStringV),
        new Arg("args", getCoreValue, { variadic: true, mapped: true }),
      ],
      async (world, { potAddress, method, args }) => {
        const pot = PotLike__factory.connect(
          potAddress.val,
          world.hre.ethers.provider
        );
        const argStrings = args.map((arg) => arg.val);
        return new NumberV(await pot.callStatic[method.val](...argStrings));
      }
    ),

    new Fetcher<
      { vatAddress: AddressV; method: StringV; args: StringV[] },
      Value
    >(
      `
        #### VatAt

        * "MCD VatAt <vatAddress> <method> <args>"
          * E.g. "MCD VatAt "0xVatAddress" "dai" (CToken cDai Address)"
      `,
      "VatAt",
      [
        new Arg("vatAddress", getAddressV),
        new Arg("method", getStringV),
        new Arg("args", getCoreValue, { variadic: true, mapped: true }),
      ],
      async (world, { vatAddress, method, args }) => {
        const vat = VatLike__factory.connect(
          vatAddress.val,
          world.hre.ethers.provider
        );
        const argStrings = args.map((arg) => arg.val);
        return new NumberV(await vat.callStatic[method.val](...argStrings));
      }
    ),
  ];
}

export async function getMCDValue(world: World, event: Event): Promise<Value> {
  return await getFetcherValue<any, any>("MCD", mcdFetchers(), world, event);
}
