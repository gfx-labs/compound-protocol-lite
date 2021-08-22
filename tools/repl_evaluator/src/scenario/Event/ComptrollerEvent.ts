import { Event } from "../Event";
import { addAction, describeUser, World } from "../World";
import { decodeCall, getPastEvents } from "../Contract";
import { CToken } from "../../../../../typechain/CToken";
import { invoke } from "../Invokation";
import {
  getAddressV,
  getBoolV,
  getEventV,
  getExpNumberV,
  getNumberV,
  getPercentV,
  getStringV,
  getCoreValue,
} from "../CoreValue";

import {
  Comptroller,
  ComptrollerG1,
  ComptrollerG2,
  ComptrollerG3,
  ComptrollerG4,
  ComptrollerG5,
  ComptrollerG6,
  ComptrollerG7,
  ComptrollerScenario,
  ComptrollerScenarioG1,
  ComptrollerScenarioG2,
  ComptrollerScenarioG3,
  ComptrollerScenarioG4,
  ComptrollerScenarioG5,
  ComptrollerScenarioG6,
  ComptrollerBorked,
  Unitroller,
  Unitroller__factory,
} from "../../../../../typechain";

export type ComptrollerS = ComptrollerScenario;
export type ComptrollerG1S = ComptrollerScenarioG1;
export type ComptrollerG2S = ComptrollerScenarioG2;
export type ComptrollerG3S = ComptrollerScenarioG3;
export type ComptrollerG4S = ComptrollerScenarioG4;
export type ComptrollerG5S = ComptrollerScenarioG5;
export type ComptrollerG6S = ComptrollerScenarioG6;
// ComptrollerGXS = ComptrollerGX + ComptrollerScenarioGX

export type ComptrollerImplS = ComptrollerImpl | ComptrollerScenarioImpl;

import { AddressV, BoolV, EventV, NumberV, StringV } from "../Value";
import { Arg, Command, View, processCommandEvent } from "../Command";
import {
  buildComptrollerImpl,
  ComptrollerImpl,
  ComptrollerScenarioImpl,
} from "../Builder/ComptrollerImplBuilder";
import { ComptrollerErrorReporter } from "../ErrorReporter";
import { getComptroller } from "../ContractLookup";
import { getLiquidity } from "../Value/ComptrollerValue";
import { getCTokenV } from "../Value/CTokenValue";
import { encodeABI, rawValues } from "../Utils";

async function genComptroller(
  world: World,
  from: string,
  params: Event
): Promise<World> {
  let {
    world: nextWorld,
    comptrollerImpl: comptroller,
    comptrollerImplData: comptrollerData,
  } = await buildComptrollerImpl(world, from, params);
  world = nextWorld;

  world = addAction(
    world,
    `Added Comptroller (${comptrollerData.description}) at address ${comptroller.address}`,
    comptrollerData.invokation
  );

  return world;
}

type setPausedTypes =
  | ComptrollerG2S
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S
  | ComptrollerG7;
const canSetPaused = (o: any): o is setPausedTypes => {
  return o["_setMintPaused"] != undefined;
};
async function setPaused(
  world: World,
  from: string,
  comptroller: setPausedTypes,
  actionName: string,
  isPaused: boolean
): Promise<World> {
  const pauseMap = {
    Mint: [comptroller.populateTransaction._setMintPaused, "_setMintPaused"],
  };

  if (!pauseMap[actionName]) {
    throw `Cannot find pause function for action "${actionName}"`;
  }

  let invokation = await invoke(
    world,
    from,
    comptroller,
    pauseMap[actionName][0]([isPaused]),
    pauseMap[actionName][1],
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comptroller: set paused for ${actionName} to ${isPaused}`,
    invokation
  );

  return world;
}

type setMaxAssetsTypes =
  | ComptrollerG1S
  | ComptrollerG2S
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S;

const canSetMaxAsset = (o: any): o is setMaxAssetsTypes => {
  return o["_setMaxAssets"] != undefined;
};

async function setMaxAssets(
  world: World,
  from: string,
  comptroller: setMaxAssetsTypes,
  numberOfAssets: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setMaxAssets(
      numberOfAssets.encode()
    ),
    "_setMaxAssets",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Set max assets to ${numberOfAssets.show()}`,
    invokation
  );

  return world;
}

async function setLiquidationIncentive(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  liquidationIncentive: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setLiquidationIncentive(
      liquidationIncentive.encode()
    ),
    "_setLiquidationIncentive",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Set liquidation incentive to ${liquidationIncentive.show()}`,
    invokation
  );

  return world;
}

async function supportMarket(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  cToken: CToken
): Promise<World> {
  if (world.dryRun) {
    // Skip this specifically on dry runs since it's likely to crash due to a number of reasons
    world.printer.printLine(
      `Dry run: Supporting market  \`${cToken.address}\``
    );
    return world;
  }

  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._supportMarket(cToken.address),
    "_supportMarket",
    ComptrollerErrorReporter
  );

  world = addAction(world, `Supported market ${cToken.name}`, invokation);

  return world;
}

type unlistMarketTypes =
  | ComptrollerScenario
  | ComptrollerScenarioG1
  | ComptrollerScenarioG3
  | ComptrollerScenarioG4
  | ComptrollerScenarioG5
  | ComptrollerScenarioG6;

const canUnlistMarketTypes = (o: any): o is unlistMarketTypes => {
  return o["unlist"] != undefined;
};
async function unlistMarket(
  world: World,
  from: string,
  comptroller: unlistMarketTypes,
  cToken: CToken
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction.unlist(cToken.address),
    "_address",
    ComptrollerErrorReporter
  );

  world = addAction(world, `Unlisted market ${cToken.name}`, invokation);

  return world;
}

async function enterMarkets(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  assets: string[]
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction.enterMarkets(assets),
    "enterMarkets",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Called enter assets ${assets} as ${describeUser(world, from)}`,
    invokation
  );

  return world;
}

async function exitMarket(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  asset: string
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction.exitMarket(asset),
    "exitMarket",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Called exit market ${asset} as ${describeUser(world, from)}`,
    invokation
  );

  return world;
}

async function setPriceOracle(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  priceOracleAddr: string
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setPriceOracle(priceOracleAddr),
    "_setPriceOracle",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Set price oracle for to ${priceOracleAddr} as ${describeUser(
      world,
      from
    )}`,
    invokation
  );

  return world;
}

async function setCollateralFactor(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  cToken: CToken,
  collateralFactor: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setCollateralFactor(
      cToken.address,
      collateralFactor.encode()
    ),
    "_setCollateralFactor",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Set collateral factor for ${cToken.name} to ${collateralFactor.show()}`,
    invokation
  );

  return world;
}

async function setCloseFactor(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  closeFactor: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setCloseFactor(closeFactor.encode()),
    "_setCloseFactor",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Set close factor to ${closeFactor.show()}`,
    invokation
  );

  return world;
}

const canFastForward = (o: any): o is ComptrollerScenarioImpl => {
  return o["fastForward"] != 0;
};
async function fastForward(
  world: World,
  from: string,
  comptroller: ComptrollerScenarioImpl,
  blocks: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction.fastForward(blocks.encode()),
    "fastForward",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Fast forward ${blocks.show()} blocks to #${invokation.value}`,
    invokation
  );

  return world;
}

async function sendAny(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  signature: string,
  callArgs: string[]
): Promise<World> {
  const fnData = encodeABI(world, signature, callArgs);
  await world.hre.ethers.provider.getSigner().sendTransaction({
    to: comptroller.address,
    data: fnData,
    from: from,
  });
  return world;
}

type addCompMarketsTypes =
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S;

const canAddCompMarkets = (o: any): o is addCompMarketsTypes => {
  return o["_addCompMarkets"] != undefined;
};

async function addCompMarkets(
  world: World,
  from: string,
  comptroller: addCompMarketsTypes,
  cTokens: CToken[]
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._addCompMarkets(
      cTokens.map((c) => c.address)
    ),
    "_addCompMarkets",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Added COMP markets ${cTokens.map((c) => c.name)}`,
    invokation
  );

  return world;
}

type dropCompMarketTypes =
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S;

const canDropCompMarket = (o: any): o is dropCompMarketTypes => {
  return o["_dropCompMarket"] != undefined;
};

async function dropCompMarket(
  world: World,
  from: string,
  comptroller: dropCompMarketTypes,
  cToken: CToken
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._dropCompMarket(cToken.address),
    "_dropCompMarket",
    ComptrollerErrorReporter
  );

  world = addAction(world, `Drop COMP market ${cToken.name}`, invokation);

  return world;
}

type refreshCompSpeedsType =
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S;

const canRefreshCompSpeeds = (o: any): o is refreshCompSpeedsType => {
  return o["refreshCompSpeeds"] != undefined;
};

async function refreshCompSpeeds(
  world: World,
  from: string,
  comptroller: refreshCompSpeedsType
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction.refreshCompSpeeds(),
    "refreshCompSpeeds",
    ComptrollerErrorReporter
  );

  world = addAction(world, `Refreshed COMP speeds`, invokation);

  return world;
}

type claimCompTypes =
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S
  | ComptrollerG7;

const canClaimComp = (o: any): o is claimCompTypes => {
  return o["claimComp(address)"] != undefined;
};

async function claimComp(
  world: World,
  from: string,
  comptroller: claimCompTypes,
  holder: string
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction["claimComp(address)"](holder),
    from,
    ComptrollerErrorReporter
  );

  world = addAction(world, `Comp claimed by ${holder}`, invokation);

  return world;
}

type updateContributorRewardsTypes = ComptrollerG6S | ComptrollerG7;

const canUpdateContributorRewards = (
  o: any
): o is updateContributorRewardsTypes => {
  return o["updateContributorRewards"] != undefined;
};

async function updateContributorRewards(
  world: World,
  from: string,
  comptroller: updateContributorRewardsTypes,
  contributor: string
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction.updateContributorRewards(contributor),
    from,
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Contributor rewards updated for ${contributor}`,
    invokation
  );

  return world;
}

type grantCompTypes = ComptrollerG6S | ComptrollerG7;

const canGrantCompTypes = (o: any): o is grantCompTypes => {
  return o["_grantComp"] != undefined;
};

async function grantComp(
  world: World,
  from: string,
  comptroller: grantCompTypes,
  recipient: string,
  amount: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._grantComp(
      recipient,
      amount.encode()
    ),
    from,
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `${amount.show()} comp granted to ${recipient}`,
    invokation
  );

  return world;
}

type setCompRateTypes =
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S;

const canSetCompRate = (o: any): o is setCompRateTypes => {
  return o["_setCompRate"] != undefined;
};

async function setCompRate(
  world: World,
  from: string,
  comptroller: setCompRateTypes,
  rate: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setCompRate(rate.encode()),
    from,
    ComptrollerErrorReporter
  );

  world = addAction(world, `Comp rate set to ${rate.show()}`, invokation);

  return world;
}
type setCompSpeedTypes = Comptroller | ComptrollerG7;
const canSetCompSpeed = (o: any): o is setCompSpeedTypes => {
  return o["_setCompSpeed"] != undefined;
};

async function setCompSpeed(
  world: World,
  from: string,
  comptroller: setCompSpeedTypes,
  cToken: CToken,
  speed: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setCompSpeed(
      cToken.address,
      speed.encode()
    ),
    "_setCompSpeed",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comp speed for market ${cToken.address} set to ${speed.show()}`,
    invokation
  );

  return world;
}

type setContributorCompSpeedTypes = ComptrollerG6S | ComptrollerG7;
const canSetContributorCompSpeed = (
  o: any
): o is setContributorCompSpeedTypes => {
  return o["_setContributorCompSpeed"] != undefined;
};

async function setContributorCompSpeed(
  world: World,
  from: string,
  comptroller: setContributorCompSpeedTypes,
  contributor: string,
  speed: NumberV
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setContributorCompSpeed(
      contributor,
      speed.encode()
    ),
    "_setContributorCompSpeed",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comp speed for contributor ${contributor} set to ${speed.show()}`,
    invokation
  );

  return world;
}

async function printLiquidity(
  world: World,
  comptroller: ComptrollerImplS
): Promise<World> {
  let enterEvents = await getPastEvents(
    world,
    comptroller,
    "StdComptroller",
    "MarketEntered"
  );
  let addresses = enterEvents.map((event) => event.args["account"]);
  let uniq = [...new Set(addresses)];

  world.printer.printLine("Liquidity:");

  const liquidityMap = await Promise.all(
    uniq.map(async (address) => {
      let userLiquidity = await getLiquidity(world, comptroller, address);

      return [address, userLiquidity.val];
    })
  );

  liquidityMap.forEach(([address, liquidity]) => {
    world.printer.printLine(
      `\t${world.settings.lookupAlias(address)}: ${liquidity / 1e18}e18`
    );
  });

  return world;
}

async function setPendingAdmin(
  world: World,
  from: string,
  comptroller: ComptrollerImplS,
  newPendingAdmin: string
): Promise<World> {
  const unitroller = new Unitroller__factory().attach(comptroller.address);
  let invokation = await invoke(
    world,
    from,
    unitroller,
    await unitroller.populateTransaction._setPendingAdmin(newPendingAdmin),
    "_setPendingAdmin",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comptroller: ${describeUser(
      world,
      from
    )} sets pending admin to ${newPendingAdmin}`,
    invokation
  );

  return world;
}

async function acceptAdmin(
  world: World,
  from: string,
  comptroller: ComptrollerImplS
): Promise<World> {
  const unitroller = new Unitroller__factory().attach(comptroller.address);
  let invokation = await invoke(
    world,
    from,
    unitroller,
    await unitroller.populateTransaction._acceptAdmin(),
    "_acceptAdmin",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comptroller: ${describeUser(world, from)} accepts admin`,
    invokation
  );

  return world;
}

type setPauseGuardianTypes =
  | ComptrollerG2S
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S
  | ComptrollerG7;
const canSetPauseGuardian = (o: any): o is setPauseGuardianTypes => {
  return o["_setPauseGuardian"] != undefined;
};

async function setPauseGuardian(
  world: World,
  from: string,
  comptroller: setPauseGuardianTypes,
  newPauseGuardian: string
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setPauseGuardian(newPauseGuardian),
    "_setPauseGuardian",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comptroller: ${describeUser(
      world,
      from
    )} sets pause guardian to ${newPauseGuardian}`,
    invokation
  );

  return world;
}

type setGuardianPausedTypes =
  | ComptrollerG2S
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S
  | ComptrollerG7;

const canSetGuardianPaused = (o: any): o is setGuardianPausedTypes => {
  return o["_setTransferPaused"] != undefined;
};

async function setGuardianPaused(
  world: World,
  from: string,
  comptroller: setGuardianPausedTypes,
  action: string,
  state: boolean
): Promise<World> {
  let fun: any;
  let method: string;
  switch (action) {
    case "Transfer":
      fun = comptroller.populateTransaction._setTransferPaused;
      method = "_setTransferPaused";
      break;
    case "Seize":
      fun = comptroller.populateTransaction._setSeizePaused;
      method = "_setSeizePaused";
      break;
  }
  let invokation = await invoke(
    world,
    from,
    comptroller,
    fun(state),
    method,
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comptroller: ${describeUser(world, from)} sets ${action} paused`,
    invokation
  );

  return world;
}

type setGuardianMarketPausedTypes =
  | ComptrollerG2S
  | ComptrollerG3S
  | ComptrollerG4S
  | ComptrollerG5S
  | ComptrollerG6S
  | ComptrollerG7;

const canSetGuardianMarketPaused = (
  o: any
): o is setGuardianMarketPausedTypes => {
  return o["_setMintPaused"] != undefined;
};
async function setGuardianMarketPaused(
  world: World,
  from: string,
  comptroller: setGuardianMarketPausedTypes,
  cToken: CToken,
  action: string,
  state: boolean
): Promise<World> {
  let fun: any;
  let method: string;
  switch (action) {
    case "Mint":
      fun = comptroller.populateTransaction._setMintPaused;
      method = "_setMintPaused";
      break;
    case "Borrow":
      fun = comptroller.populateTransaction._setBorrowPaused;
      method = "_setBorrowPaused";
      break;
  }
  let invokation = await invoke(
    world,
    from,
    comptroller,
    fun(cToken.address, state),
    method,
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comptroller: ${describeUser(world, from)} sets ${action} paused`,
    invokation
  );

  return world;
}

type setMarketBorrowCapsTypes = ComptrollerG5S | ComptrollerG6S | ComptrollerG7;
const canSetMarketBorrowCaps = (o: any): o is setMarketBorrowCapsTypes => {
  return o["_setMarketBorrowCaps"] != undefined;
};

async function setMarketBorrowCaps(
  world: World,
  from: string,
  comptroller: setMarketBorrowCapsTypes,
  cTokens: CToken[],
  borrowCaps: NumberV[]
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setMarketBorrowCaps(
      cTokens.map((c) => c.address),
      borrowCaps.map((c) => c.encode())
    ),
    "_setMarketBorrowCaps",
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Borrow caps on ${cTokens} set to ${borrowCaps}`,
    invokation
  );

  return world;
}
type setBorrowCapGuardianTypes =
  | ComptrollerG5S
  | ComptrollerG6S
  | ComptrollerG7;
const canSetBorrowCapGuardian = (o: any): o is setBorrowCapGuardianTypes => {
  return o["_setBorrowCapGuardian"] != undefined;
};
async function setBorrowCapGuardian(
  world: World,
  from: string,
  comptroller: setBorrowCapGuardianTypes,
  newBorrowCapGuardian: string
): Promise<World> {
  let invokation = await invoke(
    world,
    from,
    comptroller,
    await comptroller.populateTransaction._setBorrowCapGuardian(
      newBorrowCapGuardian
    ),
    from,
    ComptrollerErrorReporter
  );

  world = addAction(
    world,
    `Comptroller: ${describeUser(
      world,
      from
    )} sets borrow cap guardian to ${newBorrowCapGuardian}`,
    invokation
  );

  return world;
}

export function comptrollerCommands() {
  return [
    new Command<{ comptrollerParams: EventV }>(
      `
      #### Deploy

      * "Comptroller Deploy ...comptrollerParams" - Generates a new Comptroller (not as Impl)
      * E.g. "Comptroller Deploy YesNo"
      `,
      "Deploy",
      [new Arg("comptrollerParams", getEventV, { variadic: true })],
      (world, from, { comptrollerParams }) =>
        genComptroller(world, from, comptrollerParams.val)
    ),
    new Command<{
      comptroller: ComptrollerImplS;
      action: StringV;
      isPaused: BoolV;
    }>(
      `
      #### SetPaused

      * "Comptroller SetPaused <Action> <Bool>" - Pauses or unpaused given cToken function
      * E.g. "Comptroller SetPaused "Mint" True"
      `,
      "SetPaused",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("action", getStringV),
        new Arg("isPaused", getBoolV),
      ],
      (world, from, { comptroller, action, isPaused }) => {
        if (canSetPaused(comptroller)) {
          return setPaused(world, from, comptroller, action.val, isPaused.val);
        }
        console.log("The selected comptroller does not implement setPaused");
        return Promise.resolve(world);
      }
    ),
    new Command<{ comptroller: Comptroller; cToken: CToken }>(
      `
      #### SupportMarket

      * "Comptroller SupportMarket <CToken>" - Adds support in the Comptroller for the given cToken
        * E.g. "Comptroller SupportMarket cZRX"
      `,
      "SupportMarket",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cToken", getCTokenV),
      ],
      (world, from, { comptroller, cToken }) =>
        supportMarket(world, from, comptroller, cToken)
    ),
    new Command<{ comptroller: any; cToken: CToken }>(
      `
      #### UnList

      * "Comptroller UnList <CToken>" - Mock unlists a given market in tests
      * E.g. "Comptroller UnList cZRX"
      `,
      "UnList",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cToken", getCTokenV),
      ],
      (world, from, { comptroller, cToken }) =>
        unlistMarket(world, from, comptroller, cToken)
    ),
    new Command<{ comptroller: Comptroller; cTokens: CToken[] }>(
      `
      #### EnterMarkets

      * "Comptroller EnterMarkets (<CToken> ...)" - User enters the given markets
      * E.g. "Comptroller EnterMarkets (cZRX cETH)"
      `,
      "EnterMarkets",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cTokens", getCTokenV, { mapped: true }),
      ],
      (world, from, { comptroller, cTokens }) =>
        enterMarkets(
          world,
          from,
          comptroller,
          cTokens.map((c) => c.address)
        )
    ),
    new Command<{ comptroller: Comptroller; cToken: CToken }>(
      `
      #### ExitMarket

      * "Comptroller ExitMarket <CToken>" - User exits the given markets
      * E.g. "Comptroller ExitMarket cZRX"
      `,
      "ExitMarket",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cToken", getCTokenV),
      ],
      (world, from, { comptroller, cToken }) =>
        exitMarket(world, from, comptroller, cToken.address)
    ),
    new Command<{ comptroller: Comptroller; maxAssets: NumberV }>(
      `
      #### SetMaxAssets

      * "Comptroller SetMaxAssets <Number>" - Sets (or resets) the max allowed asset count
      * E.g. "Comptroller SetMaxAssets 4"
      `,
      "SetMaxAssets",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("maxAssets", getNumberV),
      ],
      (world, from, { comptroller, maxAssets }) => {
        if (canSetMaxAsset(comptroller)) {
          return setMaxAssets(world, from, comptroller, maxAssets);
        }
        console.log("The selected comptroller does not implement setPaused");
        return Promise.resolve(world);
      }
    ),
    new Command<{ comptroller: Comptroller; liquidationIncentive: NumberV }>(
      `
      #### LiquidationIncentive

      * "Comptroller LiquidationIncentive <Number>" - Sets the liquidation incentive
      * E.g. "Comptroller LiquidationIncentive 1.1"
      `,
      "LiquidationIncentive",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("liquidationIncentive", getExpNumberV),
      ],
      (world, from, { comptroller, liquidationIncentive }) =>
        setLiquidationIncentive(world, from, comptroller, liquidationIncentive)
    ),
    new Command<{ comptroller: Comptroller; priceOracle: AddressV }>(
      `
      #### SetPriceOracle

      * "Comptroller SetPriceOracle oracle:<Address>" - Sets the price oracle address
      * E.g. "Comptroller SetPriceOracle 0x..."
      `,
      "SetPriceOracle",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("priceOracle", getAddressV),
      ],
      (world, from, { comptroller, priceOracle }) =>
        setPriceOracle(world, from, comptroller, priceOracle.val)
    ),
    new Command<{
      comptroller: Comptroller;
      cToken: CToken;
      collateralFactor: NumberV;
    }>(
      `
      #### SetCollateralFactor

      * "Comptroller SetCollateralFactor <CToken> <Number>" - Sets the collateral factor for given cToken to number
        * E.g. "Comptroller SetCollateralFactor cZRX 0.1"
      `,
      "SetCollateralFactor",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cToken", getCTokenV),
        new Arg("collateralFactor", getExpNumberV),
      ],
      (world, from, { comptroller, cToken, collateralFactor }) =>
        setCollateralFactor(world, from, comptroller, cToken, collateralFactor)
    ),
    new Command<{ comptroller: Comptroller; closeFactor: NumberV }>(
      `
      #### SetCloseFactor

      * "Comptroller SetCloseFactor <Number>" - Sets the close factor to given percentage
      * E.g. "Comptroller SetCloseFactor 0.2"
      `,
      "SetCloseFactor",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("closeFactor", getPercentV),
      ],
      (world, from, { comptroller, closeFactor }) =>
        setCloseFactor(world, from, comptroller, closeFactor)
    ),
    new Command<{ comptroller: Comptroller; newPendingAdmin: AddressV }>(
      `
      #### SetPendingAdmin

      * "Comptroller SetPendingAdmin newPendingAdmin:<Address>" - Sets the pending admin for the Comptroller
        * E.g. "Comptroller SetPendingAdmin Geoff"
      `,
      "SetPendingAdmin",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("newPendingAdmin", getAddressV),
      ],
      (world, from, { comptroller, newPendingAdmin }) =>
        setPendingAdmin(world, from, comptroller, newPendingAdmin.val)
    ),
    new Command<{ comptroller: Comptroller }>(
      `
      #### AcceptAdmin

      * "Comptroller AcceptAdmin" - Accepts admin for the Comptroller
        * E.g. "From Geoff (Comptroller AcceptAdmin)"
      `,
      "AcceptAdmin",
      [new Arg("comptroller", getComptroller, { implicit: true })],
      (world, from, { comptroller }) => acceptAdmin(world, from, comptroller)
    ),
    new Command<{ comptroller: Comptroller; newPauseGuardian: AddressV }>(
      `
      #### SetPauseGuardian

      * "Comptroller SetPauseGuardian newPauseGuardian:<Address>" - Sets the PauseGuardian for the Comptroller
        * E.g. "Comptroller SetPauseGuardian Geoff"
      `,
      "SetPauseGuardian",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("newPauseGuardian", getAddressV),
      ],
      (world, from, { comptroller, newPauseGuardian }) =>
        setPauseGuardian(world, from, comptroller, newPauseGuardian.val)
    ),

    new Command<{ comptroller: Comptroller; action: StringV; isPaused: BoolV }>(
      `
      #### SetGuardianPaused

      * "Comptroller SetGuardianPaused <Action> <Bool>" - Pauses or unpaused given cToken function
      * E.g. "Comptroller SetGuardianPaused "Transfer" True"
      `,
      "SetGuardianPaused",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("action", getStringV),
        new Arg("isPaused", getBoolV),
      ],
      (world, from, { comptroller, action, isPaused }) =>
        setGuardianPaused(world, from, comptroller, action.val, isPaused.val)
    ),

    new Command<{
      comptroller: Comptroller;
      cToken: CToken;
      action: StringV;
      isPaused: BoolV;
    }>(
      `
      #### SetGuardianMarketPaused

      * "Comptroller SetGuardianMarketPaused <CToken> <Action> <Bool>" - Pauses or unpaused given cToken function
      * E.g. "Comptroller SetGuardianMarketPaused cREP "Mint" True"
      `,
      "SetGuardianMarketPaused",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cToken", getCTokenV),
        new Arg("action", getStringV),
        new Arg("isPaused", getBoolV),
      ],
      (world, from, { comptroller, cToken, action, isPaused }) =>
        setGuardianMarketPaused(
          world,
          from,
          comptroller,
          cToken,
          action.val,
          isPaused.val
        )
    ),

    new Command<{
      comptroller: Comptroller;
      blocks: NumberV;
      _keyword: StringV;
    }>(
      `
      #### FastForward

      * "FastForward n:<Number> Blocks" - Moves the block number forward "n" blocks. Note: in "CTokenScenario" and "ComptrollerScenario" the current block number is mocked (starting at 100000). This is the only way for the protocol to see a higher block number (for accruing interest).
          * E.g. "Comptroller FastForward 5 Blocks" - Move block number forward 5 blocks.
            `,
      "FastForward",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("blocks", getNumberV),
        new Arg("_keyword", getStringV),
      ],
      (world, from, { comptroller, blocks }) => {
        if (canFastForward(comptroller)) {
          return fastForward(world, from, comptroller, blocks);
        }
        console.log("The selected Comptroller does not support FastForward");
        return Promise.resolve(world);
      }
    ),
    new View<{ comptroller: Comptroller }>(
      `
      #### Liquidity

      * "Comptroller Liquidity" - Prints liquidity of all minters or borrowers
      `,
      "Liquidity",
      [new Arg("comptroller", getComptroller, { implicit: true })],
      (world, { comptroller }) => printLiquidity(world, comptroller)
    ),
    new View<{ comptroller: Comptroller; input: StringV }>(
      `
      #### Decode

      * "Decode input:<String>" - Prints information about a call to a Comptroller contract
      `,
      "Decode",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("input", getStringV),
      ],
      (world, { comptroller, input }) =>
        decodeCall(world, comptroller, input.val)
    ),

    new Command<{
      comptroller: Comptroller;
      signature: StringV;
      callArgs: StringV[];
    }>(
      `
      #### Send
      * Comptroller Send functionSignature:<String> callArgs[] - Sends any transaction to comptroller
      * E.g: Comptroller Send "setCompAddress(address)" (Address COMP)
      `,
      "Send",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("signature", getStringV),
        new Arg("callArgs", getCoreValue, { variadic: true, mapped: true }),
      ],
      (world, from, { comptroller, signature, callArgs }) =>
        sendAny(world, from, comptroller, signature.val, rawValues(callArgs))
    ),
    new Command<{ comptroller: Comptroller; cTokens: CToken[] }>(
      `
      #### AddCompMarkets

      * "Comptroller AddCompMarkets (<Address> ...)" - Makes a market COMP-enabled
      * E.g. "Comptroller AddCompMarkets (cZRX cBAT)
      `,
      "AddCompMarkets",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cTokens", getCTokenV, { mapped: true }),
      ],
      (world, from, { comptroller, cTokens }) => {
        if (canAddCompMarkets(comptroller)) {
          return addCompMarkets(world, from, comptroller, cTokens);
        }
        console.log(
          "The selected Comptroller does not implement addCompMarkets"
        );
        return Promise.resolve(world);
      }
    ),
    new Command<{ comptroller: Comptroller; cToken: CToken }>(
      `
      #### DropCompMarket

      * "Comptroller DropCompMarket <Address>" - Makes a market COMP
      * E.g. "Comptroller DropCompMarket cZRX
      `,
      "DropCompMarket",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cToken", getCTokenV),
      ],
      (world, from, { comptroller, cToken }) => {
        if (canDropCompMarket(comptroller)) {
          dropCompMarket(world, from, comptroller, cToken);
          return Promise.resolve(world);
        }
        console.log(
          "The selected Comptroller does not implement dropCompMarket"
        );
        return Promise.resolve(world);
      }
    ),

    new Command<{ comptroller: Comptroller }>(
      `
      #### RefreshCompSpeeds

      * "Comptroller RefreshCompSpeeds" - Recalculates all the COMP market speeds
      * E.g. "Comptroller RefreshCompSpeeds
      `,
      "RefreshCompSpeeds",
      [new Arg("comptroller", getComptroller, { implicit: true })],
      (world, from, { comptroller }) => {
        if (canRefreshCompSpeeds(comptroller)) {
          return refreshCompSpeeds(world, from, comptroller);
        }
        console.log(
          "The selected Comptroller does not implement dropCompMarket"
        );
        return Promise.resolve(world);
      }
    ),
    new Command<{ comptroller: Comptroller; holder: AddressV }>(
      `
      #### ClaimComp

      * "Comptroller ClaimComp <holder>" - Claims comp
      * E.g. "Comptroller ClaimComp Geoff
      `,
      "ClaimComp",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("holder", getAddressV),
      ],
      (world, from, { comptroller, holder }) =>
        claimComp(world, from, comptroller, holder.val)
    ),
    new Command<{ comptroller: Comptroller; contributor: AddressV }>(
      `
      #### UpdateContributorRewards

      * "Comptroller UpdateContributorRewards <contributor>" - Updates rewards for a contributor
        * E.g. "Comptroller UpdateContributorRewards Geoff
      `,
      "UpdateContributorRewards",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("contributor", getAddressV),
      ],
      (world, from, { comptroller, contributor }) =>
        updateContributorRewards(world, from, comptroller, contributor.val)
    ),
    new Command<{
      comptroller: Comptroller;
      recipient: AddressV;
      amount: NumberV;
    }>(
      `
      #### GrantComp

      * "Comptroller GrantComp <recipient> <amount>" - Grants COMP to a recipient
      * E.g. "Comptroller GrantComp Geoff 1e18
      `,
      "GrantComp",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("recipient", getAddressV),
        new Arg("amount", getNumberV),
      ],
      (world, from, { comptroller, recipient, amount }) =>
        grantComp(world, from, comptroller, recipient.val, amount)
    ),
    new Command<{ comptroller: Comptroller; rate: NumberV }>(
      `
      #### SetCompRate

      * "Comptroller SetCompRate <rate>" - Sets COMP rate
      * E.g. "Comptroller SetCompRate 1e18
      `,
      "SetCompRate",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("rate", getNumberV),
      ],
      (world, from, { comptroller, rate }) => {
        if (canSetCompRate(comptroller)) {
          return setCompRate(world, from, comptroller, rate);
        }
        console.log("The selected Comptroller does not implement SetCompRate");
        return Promise.resolve(world);
      }
    ),
    new Command<{ comptroller: Comptroller; cToken: CToken; speed: NumberV }>(
      `
      #### SetCompSpeed
      * "Comptroller SetCompSpeed <cToken> <rate>" - Sets COMP speed for market
        * E.g. "Comptroller SetCompSpeed cToken 1000
      `,
      "SetCompSpeed",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cToken", getCTokenV),
        new Arg("speed", getNumberV),
      ],
      (world, from, { comptroller, cToken, speed }) =>
        setCompSpeed(world, from, comptroller, cToken, speed)
    ),
    new Command<{
      comptroller: Comptroller;
      contributor: AddressV;
      speed: NumberV;
    }>(
      `
      #### SetContributorCompSpeed
      * "Comptroller SetContributorCompSpeed <contributor> <rate>" - Sets COMP speed for contributor
        * E.g. "Comptroller SetContributorCompSpeed contributor 1000
      `,
      "SetContributorCompSpeed",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("contributor", getAddressV),
        new Arg("speed", getNumberV),
      ],
      (world, from, { comptroller, contributor, speed }) =>
        setContributorCompSpeed(
          world,
          from,
          comptroller,
          contributor.val,
          speed
        )
    ),
    new Command<{
      comptroller: Comptroller;
      cTokens: CToken[];
      borrowCaps: NumberV[];
    }>(
      `
      #### SetMarketBorrowCaps

      * "Comptroller SetMarketBorrowCaps (<CToken> ...) (<borrowCap> ...)" - Sets Market Borrow Caps
      * E.g "Comptroller SetMarketBorrowCaps (cZRX cUSDC) (10000.0e18, 1000.0e6)
      `,
      "SetMarketBorrowCaps",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("cTokens", getCTokenV, { mapped: true }),
        new Arg("borrowCaps", getNumberV, { mapped: true }),
      ],
      (world, from, { comptroller, cTokens, borrowCaps }) =>
        setMarketBorrowCaps(world, from, comptroller, cTokens, borrowCaps)
    ),
    new Command<{ comptroller: Comptroller; newBorrowCapGuardian: AddressV }>(
      `
      #### SetBorrowCapGuardian

      * "Comptroller SetBorrowCapGuardian newBorrowCapGuardian:<Address>" - Sets the Borrow Cap Guardian for the Comptroller
        * E.g. "Comptroller SetBorrowCapGuardian Geoff"
      `,
      "SetBorrowCapGuardian",
      [
        new Arg("comptroller", getComptroller, { implicit: true }),
        new Arg("newBorrowCapGuardian", getAddressV),
      ],
      (world, from, { comptroller, newBorrowCapGuardian }) =>
        setBorrowCapGuardian(world, from, comptroller, newBorrowCapGuardian.val)
    ),
  ];
}

export async function processComptrollerEvent(
  world: World,
  event: Event,
  from: string | null
): Promise<World> {
  return await processCommandEvent<any>(
    "Comptroller",
    comptrollerCommands(),
    world,
    event,
    from
  );
}
