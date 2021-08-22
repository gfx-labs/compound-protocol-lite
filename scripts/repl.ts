import hre from "hardhat";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import { init_world } from "../tools/repl_evaluator/src";
import {
  create_repl,
  setup_repl,
} from "../tools/repl_evaluator/src/scenario/Repl";
import { ReplEvaluator } from "../tools/repl_evaluator/src/evaluator";
import { HardhatRuntimeEnvironment } from "hardhat/types";

const main = async (hre: HardhatRuntimeEnvironment) => {
  await init_world(hre);
  await create_repl(hre.world, hre.macros);
};

main(hre)
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
