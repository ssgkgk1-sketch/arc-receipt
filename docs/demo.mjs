import { SYSTEM, ERC20, TRANSFER } from './receipt.mjs';
export const payer = '0x' + '1'.repeat(40), recipient = '0x' + '2'.repeat(40);
export const txHash = '0x' + 'a'.repeat(64), blockHash = '0x' + 'b'.repeat(64);
export function log(from, to, amount, index = 0, emitter = SYSTEM) {
  return { address: emitter, topics: [TRANSFER, '0x'+from.slice(2).padStart(64,'0'), '0x'+to.slice(2).padStart(64,'0')], data: '0x'+amount.toString(16).padStart(64,'0'), logIndex:'0x'+index.toString(16), transactionHash:txHash, blockHash };
}
export function fixture() {
  return { transactionHash:txHash, blockHash, blockNumber:'0x10', status:'0x1', gasUsed:'0x5208', effectiveGasPrice:'0x4a817c800', logs:[log(payer,recipient,12500000000000000000n),log(payer,recipient,12500000n,1,ERC20)] };
}
export const options = {txHash,recipient,sender:payer,amount:'12.5'};
