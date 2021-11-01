# Compound Protocol Lite

Experimental [Hardhat](https://hardhat.org/) repo.


## how to use

```
npm install
npm run build

optional:

TS_NODE_TRANSPILE_ONLY=1

that will speed up ur scen runner a lot a lot



npx hardhat scen --file spec/sim/0008-sweep-token/hypothetical_migration.scen

or

npx hardhat repl



```

very incomplete


make sure that your node version is high enough for hardhat
im using 16.7.0


## Running Forking Simulation Script

Modify the `main` function in `scripts/fork-simulate.ts` to simulate as needed. Make sure to set the block parameter in the `initializeForkWithSigners` function if necessary.

```
$ npx hardhat run scripts/fork-simulate.ts
```
