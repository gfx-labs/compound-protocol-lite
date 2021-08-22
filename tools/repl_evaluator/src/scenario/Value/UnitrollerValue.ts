import { Event } from "../Event";
import { World } from "../World";
import { Unitroller } from "../../../../../typechain/Unitroller";
import { AddressV, Value } from "../Value";
import { Arg, Fetcher, getFetcherValue } from "../Command";
import { getUnitroller } from "../ContractLookup";

export async function getUnitrollerAddress(
  _world: World,
  unitroller: Unitroller
): Promise<AddressV> {
  return new AddressV(unitroller.address);
}

async function getUnitrollerAdmin(
  _world: World,
  unitroller: Unitroller
): Promise<AddressV> {
  return new AddressV(await unitroller.callStatic.admin());
}

async function getUnitrollerPendingAdmin(
  _world: World,
  unitroller: Unitroller
): Promise<AddressV> {
  return new AddressV(await unitroller.callStatic.pendingAdmin());
}

async function getComptrollerImplementation(
  _world: World,
  unitroller: Unitroller
): Promise<AddressV> {
  return new AddressV(await unitroller.callStatic.comptrollerImplementation());
}

async function getPendingComptrollerImplementation(
  _world: World,
  unitroller: Unitroller
): Promise<AddressV> {
  return new AddressV(
    await unitroller.callStatic.pendingComptrollerImplementation()
  );
}

export function unitrollerFetchers() {
  return [
    new Fetcher<{ unitroller: Unitroller }, AddressV>(
      `
        #### Address

        * "Unitroller Address" - Returns address of unitroller
      `,
      "Address",
      [new Arg("unitroller", getUnitroller, { implicit: true })],
      (world, { unitroller }) => getUnitrollerAddress(world, unitroller)
    ),
    new Fetcher<{ unitroller: Unitroller }, AddressV>(
      `
        #### Admin

        * "Unitroller Admin" - Returns the admin of Unitroller contract
          * E.g. "Unitroller Admin" - Returns address of admin
      `,
      "Admin",
      [new Arg("unitroller", getUnitroller, { implicit: true })],
      (world, { unitroller }) => getUnitrollerAdmin(world, unitroller)
    ),
    new Fetcher<{ unitroller: Unitroller }, AddressV>(
      `
        #### PendingAdmin

        * "Unitroller PendingAdmin" - Returns the pending admin of Unitroller contract
          * E.g. "Unitroller PendingAdmin" - Returns address of pendingAdmin
      `,
      "PendingAdmin",
      [new Arg("unitroller", getUnitroller, { implicit: true })],
      (world, { unitroller }) => getUnitrollerPendingAdmin(world, unitroller)
    ),
    new Fetcher<{ unitroller: Unitroller }, AddressV>(
      `
        #### Implementation

        * "Unitroller Implementation" - Returns the Implementation of Unitroller contract
          * E.g. "Unitroller Implementation" - Returns address of comptrollerImplentation
      `,
      "Implementation",
      [new Arg("unitroller", getUnitroller, { implicit: true })],
      (world, { unitroller }) => getComptrollerImplementation(world, unitroller)
    ),
    new Fetcher<{ unitroller: Unitroller }, AddressV>(
      `
        #### PendingImplementation

        * "Unitroller PendingImplementation" - Returns the pending implementation of Unitroller contract
          * E.g. "Unitroller PendingImplementation" - Returns address of pendingComptrollerImplementation
      `,
      "PendingImplementation",
      [new Arg("unitroller", getUnitroller, { implicit: true })],
      (world, { unitroller }) =>
        getPendingComptrollerImplementation(world, unitroller)
    ),
  ];
}

export async function getUnitrollerValue(
  world: World,
  event: Event
): Promise<Value> {
  return await getFetcherValue<any, any>(
    "Unitroller",
    unitrollerFetchers(),
    world,
    event
  );
}
