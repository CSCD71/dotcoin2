/* Copyright (C) 2023 Thierry Sans - All Rights Reserved
 */

import { DatabaseRead } from "../database/database-read.mjs";

import * as utils from "../utils/utils.mjs";
import * as common from "./common.mjs";

export class ClientError extends Error {
  constructor(message) {
    super(message);
    this.name = "ClientError";
  }
}

export class DotcoinClient {
    /**
     * initializes the Dotcoin client
     * @param {object} config - contains the mnemonic, the mining difficulty, the transaction limit, the coinbase amount and the NeDB path
     */
    constructor(config) {
      this.mnemonic = config.mnemonic || common.createMnemonic(); // mnemonic for genesis block
      this.difficulty = config.difficulty || 1; // mining difficulty
      this.limit = config.limit || 1024; // each block can have up to 2^10 transactions (including coinbase)
      this.amount = config.amount || 100; // coinbase amount
      this.path = config.path || "data"; // database path
      this.db = new DatabaseRead(this.path);
    }

  /**
   * returns the mnemonic as a string
   */
  getMnemonic() {

  }

  /**
   * returns the receiving key (i.e public key) as a string
   * @param {number} account - the wallet account index
   */
  async getReceivingAddress(account) {

  }

  /**
   * returns the total of dotcoin owns by the wallet account as a number
   * @param {number} account - the wallet account index
   */
  async getBalance(account) {

  }

  /**
   * returns a transaction candidate
   * @param {number} account - the wallet account index
   * @param {string} address - recipient's receiving address (i.e public key)
   * @param {number} amount - the number of dotcoin to transfer
   */
  async createTransaction(account, address, amount) {

  }

  /**
   * returns a block candidate
   * @param {number} account - the wallet account index that will receives the coinbase amount
   */
  async mine(account) {

  }
}
