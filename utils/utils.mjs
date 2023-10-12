/* Copyright (C) 2023 Thierry Sans - All Rights Reserved
 */

import { keccak_256 } from "@noble/hashes/sha3";
import { IncrementalMerkleTree } from "@zk-kit/incremental-merkle-tree";
import { HDKey } from "@scure/bip32";
import { bigintToBuf, bufToBigint } from "bigint-conversion";
import { base58check } from "@scure/base";

const base58 = base58check(keccak_256);

/**
 * converts a base58-encoded key into a Uint8Array
 * @param {string} k - base58-encoded key
 */
export function keyToUint8Array(k) {
  const key = HDKey.fromExtendedKey(k);
  return key.publicKey;
}

/**
 * converts a string into a Uint8Array
 * @param {string} s - string
 */
export function stringToUint8Array(s) {
  const encoder = new TextEncoder("utf8");
  return encoder.encode(s);
}

/**
 * converts a number into a Uint8Array
 * @param {number} num - number
 */
export function numToUint8Array(num) {
  const arr = new Uint8Array(8);
  for (let i = 0; i < 8; i++) {
    arr[i] = num % 256;
    num = Math.floor(num / 256);
  }
  return arr;
}

/**
 * returns the transaction hash
 * @param {object} transaction - the transaction object that may of may not have the "signatures" field set
 */
export function getTransactionHash(tx) {
  let output = new Uint8Array();
  if ("utxoIns" in tx) {
    for (let utxoIn of tx.utxoIns) {
      output = new Uint8Array([...output, ...keyToUint8Array(utxoIn)]);
    }
  }
  for (let utxoOut of tx.utxoOuts) {
    output = new Uint8Array([
      ...output,
      ...keyToUint8Array(utxoOut.address),
      ...numToUint8Array(utxoOut.amount),
    ]);
  }
  if ("signatures" in tx) {
    for (let signature of tx.signatures) {
      output = new Uint8Array([...output, base58.decode(signature)]);
    }
  }
  return base58.encode(keccak_256(output));
}

/**
 * returns the block hash
 * @param {object} block - the block object
 */
export function getBlockHash(block) {
  const previous = block.previous
    ? base58.decode(block.previous)
    : new Uint8Array(0);
  const root = base58.decode(block.root);
  const nonce = base58.decode(block.nonce);
  const output = new Uint8Array([...previous, ...root, ...nonce]);
  return base58.encode(keccak_256(output));
}

/**
 * returns the merkle root hash
 * @param {array<string>} leaves - the list of transaction _ids
 * @param {array<string>} height - the heigh of the merkle tree that determines the maximum number of leaves in the tree as 2^height
 */
export function getMerkleRoot(leaves, height) {
  const tree = new IncrementalMerkleTree(
    function (arr) {
      const h = keccak_256(
        new Uint8Array(...bigintToBuf(arr[0]), ...bigintToBuf(arr[1])),
      );
      return bufToBigint(h);
    },
    height,
    BigInt(0),
    2,
    leaves.map(function (leaf) {
      return bufToBigint(base58.decode(leaf));
    }),
  );
  return base58.encode(bigintToBuf(tree.root));
}
