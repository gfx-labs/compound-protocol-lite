import { Event } from "../Event";
import { World } from "../World";
import { Comp } from "../../../../../typechain/Comp";
import { getAddressV, getNumberV } from "../CoreValue";
import { AddressV, ListV, NumberV, StringV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { getComp } from "../ContractLookup";

export function compFetchers() {
  return [
    new Fetcher<{ comp: Comp }, AddressV>(
      `
        #### Address

        * "<Comp> Address" - Returns the address of Comp token
          * E.g. "Comp Address"
      `,
      "Address",
      [new Arg("comp", getComp, { implicit: true })],
      async (_world, { comp }) => new AddressV(comp.address)
    ),

    new Fetcher<{ comp: Comp }, StringV>(
      `
        #### Name

        * "<Comp> Name" - Returns the name of the Comp token
          * E.g. "Comp Name"
      `,
      "Name",
      [new Arg("comp", getComp, { implicit: true })],
      async (_world, { comp }) => new StringV(await comp.callStatic.name())
    ),

    new Fetcher<{ comp: Comp }, StringV>(
      `
        #### Symbol

        * "<Comp> Symbol" - Returns the symbol of the Comp token
          * E.g. "Comp Symbol"
      `,
      "Symbol",
      [new Arg("comp", getComp, { implicit: true })],
      async (_world, { comp }) => new StringV(await comp.callStatic.symbol())
    ),

    new Fetcher<{ comp: Comp }, NumberV>(
      `
        #### Decimals

        * "<Comp> Decimals" - Returns the number of decimals of the Comp token
          * E.g. "Comp Decimals"
      `,
      "Decimals",
      [new Arg("comp", getComp, { implicit: true })],
      async (_world, { comp }) => new NumberV(await comp.callStatic.decimals())
    ),

    new Fetcher<{ comp: Comp }, NumberV>(
      `
        #### TotalSupply

        * "Comp TotalSupply" - Returns Comp token's total supply
      `,
      "TotalSupply",
      [new Arg("comp", getComp, { implicit: true })],
      async (_world, { comp }) =>
        new NumberV(await comp.callStatic.totalSupply())
    ),

    new Fetcher<{ comp: Comp; address: AddressV }, NumberV>(
      `
        #### TokenBalance

        * "Comp TokenBalance <Address>" - Returns the Comp token balance of a given address
          * E.g. "Comp TokenBalance Geoff" - Returns Geoff's Comp balance
      `,
      "TokenBalance",
      [
        new Arg("comp", getComp, { implicit: true }),
        new Arg("address", getAddressV),
      ],
      async (_world, { comp, address }) =>
        new NumberV(await comp.callStatic.balanceOf(address.val))
    ),

    new Fetcher<{ comp: Comp; owner: AddressV; spender: AddressV }, NumberV>(
      `
        #### Allowance

        * "Comp Allowance owner:<Address> spender:<Address>" - Returns the Comp allowance from owner to spender
          * E.g. "Comp Allowance Geoff Torrey" - Returns the Comp allowance of Geoff to Torrey
      `,
      "Allowance",
      [
        new Arg("comp", getComp, { implicit: true }),
        new Arg("owner", getAddressV),
        new Arg("spender", getAddressV),
      ],
      async (_world, { comp, owner, spender }) =>
        new NumberV(await comp.callStatic.allowance(owner.val, spender.val))
    ),

    new Fetcher<{ comp: Comp; account: AddressV }, NumberV>(
      `
        #### GetCurrentVotes

        * "Comp GetCurrentVotes account:<Address>" - Returns the current Comp votes balance for an account
          * E.g. "Comp GetCurrentVotes Geoff" - Returns the current Comp vote balance of Geoff
      `,
      "GetCurrentVotes",
      [
        new Arg("comp", getComp, { implicit: true }),
        new Arg("account", getAddressV),
      ],
      async (_world, { comp, account }) =>
        new NumberV(await comp.callStatic.getCurrentVotes(account.val))
    ),

    new Fetcher<
      { comp: Comp; account: AddressV; blockNumber: NumberV },
      NumberV
    >(
      `
        #### GetPriorVotes

        * "Comp GetPriorVotes account:<Address> blockBumber:<Number>" - Returns the current Comp votes balance at given block
          * E.g. "Comp GetPriorVotes Geoff 5" - Returns the Comp vote balance for Geoff at block 5
      `,
      "GetPriorVotes",
      [
        new Arg("comp", getComp, { implicit: true }),
        new Arg("account", getAddressV),
        new Arg("blockNumber", getNumberV),
      ],
      async (_world, { comp, account, blockNumber }) =>
        new NumberV(
          await comp.callStatic.getPriorVotes(account.val, blockNumber.encode())
        )
    ),

    new Fetcher<{ comp: Comp; account: AddressV }, NumberV>(
      `
        #### GetCurrentVotesBlock

        * "Comp GetCurrentVotesBlock account:<Address>" - Returns the current Comp votes checkpoint block for an account
          * E.g. "Comp GetCurrentVotesBlock Geoff" - Returns the current Comp votes checkpoint block for Geoff
      `,
      "GetCurrentVotesBlock",
      [
        new Arg("comp", getComp, { implicit: true }),
        new Arg("account", getAddressV),
      ],
      async (_world, { comp, account }) => {
        const numCheckpoints = Number(
          await comp.callStatic.numCheckpoints(account.val)
        );
        const checkpoint = await comp.callStatic.checkpoints(
          account.val,
          numCheckpoints - 1
        );

        return new NumberV(checkpoint.fromBlock);
      }
    ),

    new Fetcher<{ comp: Comp; account: AddressV }, NumberV>(
      `
        #### VotesLength

        * "Comp VotesLength account:<Address>" - Returns the Comp vote checkpoint array length
          * E.g. "Comp VotesLength Geoff" - Returns the Comp vote checkpoint array length of Geoff
      `,
      "VotesLength",
      [
        new Arg("comp", getComp, { implicit: true }),
        new Arg("account", getAddressV),
      ],
      async (_world, { comp, account }) =>
        new NumberV(await comp.callStatic.numCheckpoints(account.val))
    ),

    new Fetcher<{ comp: Comp; account: AddressV }, ListV>(
      `
        #### AllVotes

        * "Comp AllVotes account:<Address>" - Returns information about all votes an account has had
          * E.g. "Comp AllVotes Geoff" - Returns the Comp vote checkpoint array
      `,
      "AllVotes",
      [
        new Arg("comp", getComp, { implicit: true }),
        new Arg("account", getAddressV),
      ],
      async (_world, { comp, account }) => {
        const numCheckpoints = Number(
          await comp.callStatic.numCheckpoints(account.val)
        );
        const checkpoints = await Promise.all(
          new Array(numCheckpoints).fill(undefined).map(async (_world, i) => {
            const { fromBlock, votes } = await comp.callStatic.checkpoints(
              account.val,
              i
            );

            return new StringV(
              `Block ${fromBlock}: ${votes} vote${
                votes.toNumber() !== 1 ? "s" : ""
              }`
            );
          })
        );

        return new ListV(checkpoints);
      }
    ),
  ];
}

export async function getCompValue(world: World, event: Event): Promise<Value> {
  return await getFetcherValue<any, any>("Comp", compFetchers(), world, event);
}
