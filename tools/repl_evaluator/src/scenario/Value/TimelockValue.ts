import { Event } from "../Event";
import { World } from "../World";
import { Timelock } from "../../../../../typechain/Timelock";
import {
  getAddressV,
  getCoreValue,
  getNumberV,
  getStringV,
} from "../CoreValue";
import { AddressV, BoolV, NumberV, StringV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { getTimelock } from "../ContractLookup";
import { encodeParameters } from "../Utils";

export async function getTimelockAddress(
  _world: World,
  timelock: Timelock
): Promise<AddressV> {
  return new AddressV(timelock.address);
}

async function getAdmin(_world: World, timelock: Timelock): Promise<AddressV> {
  return new AddressV(await timelock.callStatic.admin());
}

async function getPendingAdmin(
  _world: World,
  timelock: Timelock
): Promise<AddressV> {
  return new AddressV(await timelock.callStatic.pendingAdmin());
}

async function getDelay(_world: World, timelock: Timelock): Promise<NumberV> {
  return new NumberV(await timelock.callStatic.delay());
}

async function queuedTransaction(
  _world: World,
  timelock: Timelock,
  txHash: string
): Promise<BoolV> {
  return new BoolV(await timelock.callStatic.queuedTransactions(txHash));
}

export function timelockFetchers() {
  return [
    new Fetcher<{ timelock: Timelock }, AddressV>(
      `
        #### Address

        * "Address" - Gets the address of the Timelock
      `,
      "Address",
      [new Arg("timelock", getTimelock, { implicit: true })],
      (world, { timelock }) => getTimelockAddress(world, timelock)
    ),
    new Fetcher<{ timelock: Timelock }, AddressV>(
      `
        #### Admin

        * "Admin" - Gets the address of the Timelock admin
      `,
      "Admin",
      [new Arg("timelock", getTimelock, { implicit: true })],
      (world, { timelock }) => getAdmin(world, timelock)
    ),
    new Fetcher<{ timelock: Timelock }, AddressV>(
      `
        #### PendingAdmin

        * "PendingAdmin" - Gets the address of the Timelock pendingAdmin
      `,
      "PendingAdmin",
      [new Arg("timelock", getTimelock, { implicit: true })],
      (world, { timelock }) => getPendingAdmin(world, timelock)
    ),
    new Fetcher<{ timelock: Timelock }, NumberV>(
      `
        #### Delay

        * "Delay" - Gets the delay of the Timelock
      `,
      "Delay",
      [new Arg("timelock", getTimelock, { implicit: true })],
      (world, { timelock }) => getDelay(world, timelock)
    ),
    new Fetcher<
      {
        target: AddressV;
        value: NumberV;
        eta: NumberV;
        signature: StringV;
        data: StringV[];
      },
      StringV
    >(
      `
        #### TxHash

        * "TxHash target:<Address> value:<Number> eta:<Number> signature:<String> ...funArgs:<CoreValue>" - Returns a hash of a transactions values
        * E.g. "Timelock TxHash \"0x0000000000000000000000000000000000000000\" 0 1569286014 \"setDelay(uint256)\" 60680"
      `,
      "TxHash",
      [
        new Arg("target", getAddressV),
        new Arg("value", getNumberV),
        new Arg("eta", getNumberV),
        new Arg("signature", getStringV),
        new Arg("data", getCoreValue, { variadic: true, mapped: true }),
      ],
      (world, { target, value, signature, data, eta }) => {
        const encodedData = encodeParameters(
          world,
          signature.val,
          data.map((a) => a.val)
        );
        const encodedTransaction =
          world.hre.ethers.utils.defaultAbiCoder.encode(
            ["address", "uint256", "string", "bytes", "uint256"],
            [target.val, value.val, signature.val, encodedData, eta.val]
          );

        return Promise.resolve(
          new StringV(world.hre.ethers.utils.keccak256(encodedTransaction))
        );
      }
    ),
    new Fetcher<{ timelock: Timelock; txHash: StringV }, BoolV>(
      `
        #### QueuedTransaction

        * "QueuedTransaction txHash:<String>" - Gets the boolean value of the given txHash in the queuedTransactions mapping
      `,
      "QueuedTransaction",
      [
        new Arg("timelock", getTimelock, { implicit: true }),
        new Arg("txHash", getStringV),
      ],
      (world, { timelock, txHash }) =>
        queuedTransaction(world, timelock, txHash.val)
    ),
  ];
}

export async function getTimelockValue(
  world: World,
  event: Event
): Promise<Value> {
  return await getFetcherValue<any, any>(
    "Timelock",
    timelockFetchers(),
    world,
    event
  );
}
