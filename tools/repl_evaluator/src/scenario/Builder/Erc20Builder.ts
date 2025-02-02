import { Event } from "../Event";
import { addAction, World } from "../World";
import { Invokation, invoke } from "../Invokation";
import { ethers } from "ethers";
import {
  getAddressV,
  getCoreValue,
  getNumberV,
  getStringV,
} from "../CoreValue";
import { AddressV, NumberV, StringV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { storeAndSaveContract } from "../Networks";
import { encodeABI } from "../Utils";
import {
  EIP20Interface,
  EIP20Interface__factory,
  ERC20,
  EvilToken,
  FaucetNonStandardToken,
  FaucetToken,
  FaucetTokenReEntrantHarness,
  FeeToken,
  TetherInterface,
  TetherInterface__factory,
  WBTCToken,
} from "../../../../../typechain";
import { deploy_contract_world } from "../Contract";

export interface TokenData {
  invokation: Invokation<ethers.Contract>;
  description: string;
  name: string;
  symbol: string;
  decimals?: number;
  address?: string;
  contract: string;
}

export async function buildErc20(
  world: World,
  from: string,
  event: Event
): Promise<{ world: World; erc20: ethers.Contract; tokenData: TokenData }> {
  const fetchers = [
    new Fetcher<
      { symbol: StringV; address: AddressV; name: StringV },
      TokenData
    >(
      `
        #### Existing

        * "Existing symbol:<String> address:<Address> name:<String>" - Wrap an existing ERC20 token
          * E.g. "ERC20 Deploy Existing DAI 0x123...
      `,
      "Existing",
      [
        new Arg("symbol", getStringV),
        new Arg("address", getAddressV),
        new Arg("name", getStringV, { default: undefined }),
      ],
      async (world, { symbol, name, address }) => {
        const existingToken = EIP20Interface__factory.connect(
          address.val,
          world.hre.ethers.provider
        );
        const tokenName = name.val === undefined ? symbol.val : name.val;
        const decimals = await existingToken.callStatic.decimals();

        return {
          invokation: new Invokation<EIP20Interface>(
            existingToken,
            null,
            null,
            existingToken,
            null,
            "ExistingToken",
            null
          ),
          description: "Existing",
          decimals: Number(decimals),
          name: tokenName,
          symbol: symbol.val,
          contract: "ExistingToken",
        };
      }
    ),

    new Fetcher<{ symbol: StringV; address: AddressV }, TokenData>(
      `
        #### ExistingTether

        * "Existing symbol:<String> address:<Address>" - Wrap an existing ERC20 token
          * E.g. "ERC20 Deploy ExistingTether USDT 0x123...
      `,
      "ExistingTether",
      [new Arg("symbol", getStringV), new Arg("address", getAddressV)],
      async (world, { symbol, address }) => {
        const contract = TetherInterface__factory.connect(
          address.val,
          world.hre.ethers.provider
        );
        return {
          invokation: new Invokation<TetherInterface>(
            contract,
            null,
            null,
            contract,
            null,
            "ExistingTether"
          ),
          description: "ExistingTether",
          name: symbol.val,
          symbol: symbol.val,
          contract: "TetherInterface",
        };
      }
    ),

    new Fetcher<
      { symbol: StringV; name: StringV; decimals: NumberV },
      TokenData
    >(
      `
        #### NonStandard

        * "NonStandard symbol:<String> name:<String> decimals:<Number=18>" - A non-standard token, like BAT
          * E.g. "ERC20 Deploy NonStandard BAT \"Basic Attention Token\" 18"
      `,
      "NonStandard",
      [
        new Arg("symbol", getStringV),
        new Arg("name", getStringV),
        new Arg("decimals", getNumberV, { default: new NumberV(18) }),
      ],
      async (world, { symbol, name, decimals }) => {
        return {
          invokation: await deploy_contract_world<FaucetNonStandardToken>(
            world,
            from,
            "FaucetNonStandardToken",
            [0, name.val, decimals.val, symbol.val]
          ),
          description: "NonStandard",
          name: name.val,
          symbol: symbol.val,
          decimals: decimals.toNumber(),
          contract: "FaucetNonStandardToken",
        };
      }
    ),

    new Fetcher<
      {
        symbol: StringV;
        name: StringV;
        fun: StringV;
        reEntryFunSig: StringV;
        reEntryFunArgs: StringV[];
      },
      TokenData
    >(
      `
        #### ReEntrant

        * "ReEntrant symbol:<String> name:string fun:<String> funSig:<String> ...funArgs:<Value>" - A token that loves to call back to spook its caller
          * E.g. "ERC20 Deploy ReEntrant PHREAK PHREAK "transfer" "mint(uint256)" 0 - A token that will call back to a CToken's mint function

        Note: valid functions: totalSupply, balanceOf, transfer, transferFrom, approve, allowance
      `,
      "ReEntrant",
      [
        new Arg("symbol", getStringV),
        new Arg("name", getStringV),
        new Arg("fun", getStringV),
        new Arg("reEntryFunSig", getStringV),
        new Arg("reEntryFunArgs", getStringV, { variadic: true, mapped: true }),
      ],
      async (world, { symbol, name, fun, reEntryFunSig, reEntryFunArgs }) => {
        const fnData = encodeABI(
          world,
          reEntryFunSig.val,
          reEntryFunArgs.map((a) => a.val)
        );

        return {
          invokation: await deploy_contract_world<FaucetTokenReEntrantHarness>(
            world,
            from,
            "FaucetTokenReEntrantHarness",
            [0, name.val, 18, symbol.val, fnData, fun.val]
          ),
          description: "ReEntrant",
          name: name.val,
          symbol: symbol.val,
          decimals: 18,
          contract: "FaucetTokenReEntrantHarness",
        };
      }
    ),

    new Fetcher<
      { symbol: StringV; name: StringV; decimals: NumberV },
      TokenData
    >(
      `
        #### Evil

        * "Evil symbol:<String> name:<String> decimals:<Number>" - A less vanilla ERC-20 contract that fails transfers
          * E.g. "ERC20 Deploy Evil BAT \"Basic Attention Token\" 18"
      `,
      "Evil",
      [
        new Arg("symbol", getStringV),
        new Arg("name", getStringV),
        new Arg("decimals", getNumberV, { default: new NumberV(18) }),
      ],
      async (world, { symbol, name, decimals }) => {
        return {
          invokation: await deploy_contract_world<EvilToken>(
            world,
            from,
            "EvilToken",
            [0, name.val, decimals.val, symbol.val]
          ),
          description: "Evil",
          name: name.val,
          symbol: symbol.val,
          decimals: decimals.toNumber(),
          contract: "EvilToken",
        };
      }
    ),

    new Fetcher<
      { symbol: StringV; name: StringV; decimals: NumberV },
      TokenData
    >(
      `
        #### Standard

        * "Standard symbol:<String> name:<String> decimals:<Number>" - A vanilla ERC-20 contract
          * E.g. "ERC20 Deploy Standard BAT \"Basic Attention Token\" 18"
      `,
      "Standard",
      [
        new Arg("symbol", getStringV),
        new Arg("name", getStringV),
        new Arg("decimals", getNumberV, { default: new NumberV(18) }),
      ],
      async (world, { symbol, name, decimals }) => {
        return {
          invokation: await deploy_contract_world<FaucetToken>(
            world,
            from,
            "FaucetToken",
            [0, name.val, decimals.val, symbol.val]
          ),
          description: "Standard",
          name: name.val,
          symbol: symbol.val,
          decimals: decimals.toNumber(),
          contract: "FaucetToken",
        };
      }
    ),

    new Fetcher<{ symbol: StringV; name: StringV }, TokenData>(
      `
        #### WBTC

        * "WBTC symbol:<String> name:<String>" - The WBTC contract
          * E.g. "ERC20 Deploy WBTC WBTC \"Wrapped Bitcoin\""
      `,
      "WBTC",
      [
        new Arg("symbol", getStringV, { default: new StringV("WBTC") }),
        new Arg("name", getStringV, {
          default: new StringV("Wrapped Bitcoin"),
        }),
      ],
      async (world, { symbol, name }) => {
        let decimals = 8;

        return {
          invokation: await deploy_contract_world<WBTCToken>(
            world,
            from,
            "WBTCToken",
            []
          ),
          description: "WBTC",
          name: name.val,
          symbol: symbol.val,
          decimals: decimals,
          contract: "WBTCToken",
        };
      }
    ),

    new Fetcher<
      {
        symbol: StringV;
        name: StringV;
        decimals: NumberV;
        basisPointFee: NumberV;
        owner: AddressV;
      },
      TokenData
    >(
      `
        #### Fee

        * "Fee symbol:<String> name:<String> decimals:<Number> basisPointFee:<Number> owner:<Address>" - An ERC20 whose owner takes a fee on transfers. Used for mocking USDT.
          * E.g. "ERC20 Deploy Fee USDT USDT 100 Root"
      `,
      "Fee",
      [
        new Arg("symbol", getStringV),
        new Arg("name", getStringV),
        new Arg("decimals", getNumberV),
        new Arg("basisPointFee", getNumberV),
        new Arg("owner", getAddressV),
      ],
      async (world, { symbol, name, decimals, basisPointFee, owner }) => {
        return {
          invokation: await deploy_contract_world<FeeToken>(
            world,
            from,
            "FeeToken",
            [
              0,
              name.val,
              decimals.val,
              symbol.val,
              basisPointFee.val,
              owner.val,
            ]
          ),
          description: "Fee",
          name: name.val,
          symbol: symbol.val,
          decimals: decimals.toNumber(),
          owner: owner.val,
          contract: "FeeToken",
        };
      }
    ),
  ];

  let tokenData = await getFetcherValue<any, TokenData>(
    "DeployERC20",
    fetchers,
    world,
    event
  );
  let invokation = tokenData.invokation;
  delete tokenData.invokation;

  if (invokation.error) {
    throw invokation.error;
  }
  const erc20 = invokation.value!;
  tokenData.address = erc20.address;

  world = await storeAndSaveContract(
    world,
    erc20,
    tokenData.symbol,
    invokation,
    [{ index: ["Tokens", tokenData.symbol], data: tokenData }]
  );

  return { world, erc20, tokenData };
}
