import { join } from "path";
import { mkdirSync, readFileSync, existsSync, writeFileSync } from "fs";
import { Command } from "commander";

import { DotcoinClient } from "../core/client.mjs";
import { readConfig, readMnemonic, writeMnemonic } from "./storage.mjs";

const databasePath = join("data", "client");

async function syncDatabase(servername, path) {
  mkdirSync(databasePath, { recursive: true });
  const transactions = await fetch(`${servername}/transactions.db`).then(
    function (res) {
      return res.text();
    },
  );
  await writeFileSync(join(databasePath, "transactions.db"), transactions);
  const blocks = await fetch(`${servername}/blocks.db`).then(function (res) {
    return res.text();
  });
  await writeFileSync(join(databasePath, "blocks.db"), blocks);
}

async function create(options) {
  const config = readConfig(options.config);
  const client = new DotcoinClient(config);
  const mnemonic = client.getMnemonic();
  await writeMnemonic(options.wallet, mnemonic, options.password);
  console.log(`wallet has been created and save in ${options.wallet}`);
}

async function mnemonic(options) {
  const mnemonic = await readMnemonic(options.wallet, options.password);
  console.log(`${mnemonic}`);
}

async function address(account, options) {
  const mnemonic = await readMnemonic(options.wallet, options.password);
  const config = readConfig(options.config);
  const client = new DotcoinClient({ path: databasePath, mnemonic, ...config });
  const publicKey = await client.getReceivingAddress(parseInt(account));
  console.log(`The address for account ${options.account} is ${publicKey}`);
}

async function balance(account, options) {
  const mnemonic = await readMnemonic(options.wallet, options.password);
  const config = readConfig(options.config);
  await syncDatabase(options.node, config.path);
  const client = new DotcoinClient({ path: databasePath, mnemonic, ...config });
  const { usable, pending } = await client.getBalance(parseInt(account));
  console.log(
    `The address for account ${account} has a balance of ${usable} (and pending: ${pending})`,
  );
}

async function transfer(account, address, amount, options) {
  const mnemonic = await readMnemonic(options.wallet, options.password);
  const config = readConfig(options.config);
  await syncDatabase(options.node, config.path);
  const client = new DotcoinClient({ path: databasePath, mnemonic, ...config });
  const transaction = await client.createTransaction(
    parseInt(account),
    address,
    amount,
  );
  await fetch(`${options.node}/transactions/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(transaction),
  }).then(async function (res) {
    if (res.status == 200)
      return console.log(JSON.stringify(await res.json(), null, 2));
    if (res.status == 400) throw new Error(`[error] ${await res.text()}`);
    if (res.status == 500) throw new Error(`[bug] ${await res.text()}`);
  });
}

async function mine(account, options) {
  const mnemonic = await readMnemonic(options.wallet, options.password);
  const config = readConfig(options.config);
  await syncDatabase(options.node, config.path);
  const client = new DotcoinClient({ path: databasePath, mnemonic, ...config });
  const blockData = await client.mine(parseInt(account));
  await fetch(`${options.node}/blocks/`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(blockData),
  }).then(async function (res) {
    if (res.status == 200)
      return console.log(JSON.stringify(await res.json(), null, 2));
    if (res.status == 400) throw new Error(`[error] ${await res.text()}`);
    if (res.status == 500) throw new Error(`[bug] ${await res.text()}`);
  });
}

const program = new Command();

program.name("dotcoin-cli").description("DotCoin Client CLI").version("0.1");

program
  .command("create")
  .description("create a wallet and export its mnemonic phrase")
  .option("-w, --wallet <walletfile>", "wallet file", "./wallet.bin")
  .option("-c, --config <configfile>", "config file", "./config.json")
  .option("-p, --password <password>", "password")
  .action(create);

program
  .command("mnemonic")
  .description("get mnemonic")
  .option("-w, --wallet <walletfile>", "wallet file", "./wallet.bin")
  .option("-c, --config <configfile>", "config file", "./config.json")
  .option("-p, --password <password>", "password")
  .action(mnemonic);

program
  .command("address")
  .description("get receiving address")
  .argument("<account>", "account")
  .option("-w, --wallet <walletfile>", "wallet file", "./wallet.bin")
  .option("-c, --config <configfile>", "config file", "./config.json")
  .option("-p, --password <password>", "password")
  .action(address);

program
  .command("balance")
  .description("get balance")
  .argument("<account>", "account")
  .option("-w, --wallet <walletfile>", "wallet file", "./wallet.bin")
  .option("-c, --config <configfile>", "config file", "./config.json")
  .option("-p, --password <password>", "password")
  .option(
    "-n, --node <servername>",
    "servername",
    "https://dotcoin.seclab.space",
  )
  .action(balance);

program
  .command("transfer")
  .description("transfer coins")
  .argument("<account>", "account")
  .argument("<address>", "recipient's address")
  .argument("<amount>", "amount to transfer")
  .option("-w, --wallet <walletfile>", "wallet file", "./wallet.bin")
  .option("-c, --config <configfile>", "config file", "./config.json")
  .option("-p, --password <password>", "password")
  .option(
    "-n, --node <servername>",
    "servername",
    "https://dotcoin.seclab.space",
  )
  .action(transfer);

program
  .command("mine")
  .description("mine the next block")
  .argument("<account>", "account")
  .option("-w, --wallet <walletfile>", "wallet file", "./wallet.bin")
  .option("-c, --config <configfile>", "config file", "./config.json")
  .option("-p, --password <password>", "password")
  .option(
    "-n, --node <servername>",
    "servername",
    "https://dotcoin.seclab.space",
  )
  .action(mine);

program.parse();
