import { Event } from "../../Event";
import { addAction, World } from "../../World";
import { buildGovernor } from "../../Builder/GovernorBravoBuilder";
import { invoke } from "../../Invokation";
import { NumberV } from "../../Value";
import { verify } from "../../Verify";
import { encodedNumber } from "../../Encoding";
import { mergeContractABI } from "../../Networks";
import {
  GovernorBravoDelegate,
  GovernorBravoDelegate__factory,
  GovernorBravoDelegator,
  GovernorBravoDelegator__factory,
} from "../../../../../../typechain";

export type GovernorBravo = GovernorBravoDelegate | GovernorBravoDelegator;

export const genGovernor = async (
  world: World,
  from: string,
  params: Event
): Promise<World> => {
  let {
    world: nextWorld,
    governor,
    govData,
  } = await buildGovernor(world, from, params);
  world = nextWorld;

  return addAction(
    world,
    `Deployed GovernorBravo ${govData.contract} to address ${governor.address}`,
    govData.invokation
  );
};

export const verifyGovernor = async (
  world: World,
  governor: GovernorBravo,
  apiKey: string,
  modelName: string,
  contractName: string
): Promise<World> => {
  if (world.isLocalNetwork()) {
    world.printer.printLine(
      `Politely declining to verify on local network: ${world.network}.`
    );
  } else {
    await verify(world, apiKey, modelName, contractName, governor.address);
  }

  return world;
};

export const mergeABI = async (
  world: World,
  from: string,
  governorDelegator: GovernorBravo,
  governorDelegate: GovernorBravo
): Promise<World> => {
  if (!world.dryRun) {
    // Skip this specifically on dry runs since it's likely to crash due to a number of reasons
    world = await mergeContractABI(
      world,
      "GovernorBravo",
      governorDelegator,
      governorDelegator.address,
      governorDelegate.address
    );
  }

  return world;
};

export const propose = async (
  world: World,
  from: string,
  governor: GovernorBravo,
  targets: string[],
  values: encodedNumber[],
  signatures: string[],
  calldatas: string[],
  description: string
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );
  const invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction.propose(
      targets,
      values,
      signatures,
      calldatas,
      description
    ),
    "propose"
  );
  return addAction(
    world,
    `Created new proposal "${description}" with id=${invokation.value} in Governor`,
    invokation
  );
};

export const setVotingDelay = async (
  world: World,
  from: string,
  governor: GovernorBravo,
  newVotingDelay: NumberV
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );
  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction._setVotingDelay(
      newVotingDelay.encode()
    ),
    "_setVotingDelay"
  );

  world = addAction(
    world,
    `Set voting delay to ${newVotingDelay.show()}`,
    invokation
  );

  return world;
};

export const setVotingPeriod = async (
  world: World,
  from: string,
  governor: GovernorBravo,
  newVotingPeriod: NumberV
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );
  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction._setVotingPeriod(
      newVotingPeriod.encode()
    ),
    "_setVotingPeriod"
  );

  world = addAction(
    world,
    `Set voting period to ${newVotingPeriod.show()}`,
    invokation
  );

  return world;
};

export const setProposalThreshold = async (
  world: World,
  from: string,
  governor: GovernorBravo,
  newProposalThreshold: NumberV
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );

  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction._setProposalThreshold(
      newProposalThreshold.encode()
    ),
    "_setProposalThreshold"
  );

  world = addAction(
    world,
    `Set proposal threshold to ${newProposalThreshold.show()}`,
    invokation
  );

  return world;
};

export const setImplementation = async (
  world: World,
  from: string,
  governor: GovernorBravo,
  newImplementation: GovernorBravo
): Promise<World> => {
  const governorBravoDelegator = new GovernorBravoDelegator__factory().attach(
    governor.address
  );
  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravoDelegator.populateTransaction._setImplementation(
      newImplementation.address
    ),
    "_setImplementation"
  );

  world = addAction(
    world,
    `Set GovernorBravo implementation to ${newImplementation}`,
    invokation
  );

  mergeABI(world, from, governor, newImplementation);

  return world;
};

export const initiate = async (
  world: World,
  from: string,
  governor: GovernorBravo,
  governorAlpha: string
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );
  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction._initiate(governorAlpha),
    "governorAlpha"
  );

  world = addAction(
    world,
    `Initiated governor from GovernorAlpha at ${governorAlpha}`,
    invokation
  );

  return world;
};

export const harnessInitiate = async (
  world: World,
  from: string,
  governor: GovernorBravo
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );
  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction["_initiate()"](),
    "_initiate"
  );

  world = addAction(
    world,
    `Initiated governor using harness function`,
    invokation
  );

  return world;
};

export const setPendingAdmin = async (
  world: World,
  from: string,
  governor: GovernorBravo,
  newPendingAdmin: string
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );
  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction._setPendingAdmin(newPendingAdmin),
    "_setPendingAdmin"
  );

  world = addAction(
    world,
    `Governor pending admin set to ${newPendingAdmin}`,
    invokation
  );

  return world;
};

export const acceptAdmin = async (
  world: World,
  from: string,
  governor: GovernorBravo
): Promise<World> => {
  const governorBravo = new GovernorBravoDelegate__factory().attach(
    governor.address
  );
  let invokation = await invoke(
    world,
    from,
    governor,
    await governorBravo.populateTransaction._acceptAdmin(),
    "_acceptAdmin"
  );

  world = addAction(world, `Governor admin accepted`, invokation);

  return world;
};

//export const setBlockNumber(
//  world: World,
//  from: string,
//  governor: GovernorBravo,
//  blockNumber: NumberV
//): Promise<World> => {
//  return addAction(
//    world,
//    `Set Governor blockNumber to ${blockNumber.show()}`,
//    await invoke(
//      world,
//      from,
//      governor,
//      await governor.populateTransaction.setBlockNumber(blockNumber.encode()),
//      "setBlockNumber"
//    )
//  );
//}
//
//export const setBlockTimestamp(
//  world: World,
//  from: string,
//  governor: GovernorBravo,
//  blockTimestamp: NumberV
//): Promise<World> => {
//  return addAction(
//    world,
//    `Set Governor blockTimestamp to ${blockTimestamp.show()}`,
//    await invoke(
//      world,
//      from,
//      governor,
//      await governor.populateTransaction.setBlockTimestamp(
//        blockTimestamp.encode()
//      ),
//      "setBlockTimestamp"
//    )
//  );
//}
