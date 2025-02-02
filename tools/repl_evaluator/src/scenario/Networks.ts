import { fromJS, Map } from "immutable";
import { World } from "./World";
import { Invokation } from "./Invokation";
import { setContractName } from "./Contract";
import { getNetworkPath, readFile, writeFile } from "./File";
import { Fragment } from "ethers/lib/utils";
import { ethers } from "ethers";

type Networks = Map<string, any>;

interface ExtraData {
  index: string[];
  data: object | string | number;
}

export function parseNetworkFile(data: string | object): Networks {
  return fromJS(typeof data === "string" ? JSON.parse(data) : data) as Networks;
}

function serializeNetworkFile(networks: Networks): string {
  return JSON.stringify(networks.toJSON(), null, 4);
}

function readNetworkFile(world: World, isABI: boolean): Promise<Networks> {
  return readFile(
    world,
    getNetworkPath(world.basePath, world.network, isABI ? "-abi" : ""),
    Map({}),
    parseNetworkFile
  );
}

function writeNetworkFile(
  world: World,
  networks: Networks,
  isABI: boolean
): Promise<World> {
  return writeFile(
    world,
    getNetworkPath(world.basePath, world.network, isABI ? "-abi" : ""),
    serializeNetworkFile(networks)
  );
}

export function storeContract(
  world: World,
  contract: ethers.Contract,
  name: string,
  extraData: ExtraData[]
): World {
  world = world.set("lastContract", contract);
  world = world.setIn(
    ["contractIndex", contract.address.toLowerCase()],
    contract
  );
  world = world.update("contractData", (contractData) => {
    return extraData.reduce((acc, { index, data }) => {
      if (typeof data !== "string" && typeof data !== "number") {
        // Store extra data as an immutable
        data = Map(<any>data);
      }

      return acc.setIn(index, data);
    }, contractData);
  });

  return world;
}

export async function saveContract<T>(
  world: World,
  contract: ethers.Contract,
  name: string,
  extraData: ExtraData[]
): Promise<World> {
  let networks = await readNetworkFile(world, false);
  let networksABI = await readNetworkFile(world, true);

  networks = extraData.reduce(
    (acc, { index, data }) => acc.setIn(index, data),
    networks
  );
  networksABI = networksABI.set(name, contract._jsonInterface);

  // Don't write during a dry-run
  if (!world.dryRun) {
    world = await writeNetworkFile(world, networks, false);
    world = await writeNetworkFile(world, networksABI, true);
  }

  return world;
}

// Merges a contract into another, which is important for delegation
export async function mergeContractABI(
  world: World,
  targetName: string,
  contractTarget: ethers.Contract,
  a: string,
  b: string
): Promise<World> {
  return world;
}

export async function loadContracts(world: World): Promise<[World, string[]]> {
  let networks = await readNetworkFile(world, false);
  let networksABI = await readNetworkFile(world, true);

  return loadContractData(world, networks, networksABI);
}

export async function loadContractData(
  world: World,
  networks: Networks,
  networksABI: Networks
): Promise<[World, string[]]> {
  // Pull off contracts value and the rest is "extra"
  let contractInfo: string[] = [];
  let contracts = networks.get("Contracts") || Map({});

  world = contracts.reduce((world: World, address: string, name: string) => {
    let abi: Fragment[] = networksABI.has(name)
      ? networksABI.get(name).toJS()
      : [];
    let contract = new world.hre.ethers.Contract(
      address,
      abi,
      world.hre.ethers.getDefaultProvider()
    );

    contractInfo.push(`${name}: ${address}`);

    // Store the contract
    // XXXS
    return world.setIn(
      ["contractIndex", contract.address.toLowerCase()],
      contract
    );
  }, world);

  world = world.update("contractData", (contractData) =>
    contractData.mergeDeep(networks)
  );

  return [world, contractInfo];
}

export async function storeAndSaveContract<T>(
  world: World,
  contract: ethers.Contract,
  name: string,
  invokation: Invokation<T> | null,
  extraData: ExtraData[]
): Promise<World> {
  extraData.push({ index: ["Contracts", name], data: contract.address });

  if (contract.constructorAbi) {
    extraData.push({
      index: ["Constructors", name],
      data: contract.constructorAbi,
    });
  }
  if (invokation && invokation.receipt) {
    extraData.push({
      index: ["Blocks", name],
      data: invokation.receipt.blockNumber,
    });
  }

  world = await saveContract(world, contract, name, extraData);

  return world;
}
