/* Copyright (C) 2023 Thierry Sans - All Rights Reserved
 */

import { DatabaseWrite } from "../database/database-write.mjs";

import { DotcoinClient } from "./client.mjs";

import * as utils from "../utils/utils.mjs";
import * as common from "./common.mjs";

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

export class DotcoinServer {
  /**
   * initializes the Dotcoin server
   * @param {object} config - contains the mnemonic, the mining difficulty, the merkle tree height, the coinbase amount and the NeDB path
   */
  constructor(config) {
    this.mnemonic = config.mnemonic || common.createMnemonic();
    this.difficulty = config.difficulty || 1;
    this.height = config.height || 8; // each block can have up to 2^8 transactions (including coinbase)
    this.amount = config.amount || 100; // coinbase amount
    this.path = config.path || "data";
    this.db = new DatabaseWrite(this.path);
  }

  /**
   * creates the genesis block if there is no block in the database
   * that genesis block can have a mining difficulty set to 0 exceptionally
   * @param {number} account - the wallet's account that should be credited with the first coinbase transaction
   */
  async init(account) {

  }

  /**
   * verifies (!!) and adds a transaction to the transaction pool
   * @param {object} txParams - the transaction data
   */
  async addTransaction(txParams) {

  }

  /**
   * verifies (!!) and adds a block to the database
   * it should also verify (!!) add the coinbase transaction and verify (!!) and update all transactions confirmed by the block
   * @param {object} block - the block data
   * @param {object} coinbase - the block's coinbase transaction
   * @param {array<string>} transactions - the list of transaction _ids (non including the coinbase one) that are confirmed by the block
   */
  async addBlock(block, coinbase, transactions) {

  }

  /**
   * retrieves a subset of blocks 
   * @param {number} page - the page index
   * @param {numbers} limit - the number of elements per page
   * @param {object} sort - either starting from the oldest one inserted (sort=1) or the latest one inserted (sort=-1)
   */
  async getBlocks(page, limit, sort = 1) {
    return this.db.getBlocks(page, limit, sort);
  }

  /**
   * retrieves the block given its hash
   * @param {string} hash - block's hash
   */
  async getBlock(hash) {
    return this.db.getBlock(hash);
  }

  /**
   * retrieves a subset of transactions
   * @param {number} page - the page index
   * @param {numbers} limit - the number of elements per page
   * @param {object} sort - either starting from the oldest one inserted (sort=1) or the latest one inserted (sort=-1)
   * @param {boolean} unconfirmed - if true, returns only the unconfirmed ones (not mined yet i.e for which the field block == null)
   */
  async getTransactions(page, limit, sort = 1, unconfirmed = false) {
    return this.db.getTransactions(page, limit, sort, unconfirmed);
  }

  /**
   * retrieves the transaction given its hash
   * @param {string} hash - transaction's hash
   */
  async getTransaction(hash) {
    return this.db.getTransaction(hash);
  }

  /**
   * retrieves the utxo (i.e transaction output) for the given address
   * @param {string} address - the address (i.e the public key) of the recipient
   */
  async getUtxo(address) {
    return this.db.getUtxo(address);
  }

  /**
   * erase the directory that stores the NeDB files
   */
  destroy() {
    this.db.destroy();
  }
}
