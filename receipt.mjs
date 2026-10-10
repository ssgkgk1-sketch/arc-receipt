export const RPC = 'https://rpc.mainnet.arc.io';
export const SYSTEM = '0xfffffffffffffffffffffffffffffffffffffffe';
export const ERC20 = '0x3600000000000000000000000000000000000000';
export const TRANSFER = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
const ZERO = '0x' + '0'.repeat(40);
export function address(s) {
  if (typeof s !== 'string' || !/^0x[0-9a-f]{40}$/i.test(s)) throw Error('Invalid address');
  return s.toLowerCase();
}
export function hash(s) {
  if (typeof s !== 'string' || !/^0x[0-9a-f]{64}$/i.test(s)) throw Error('Invalid transaction hash');
  return s.toLowerCase();
}
export function quantity(s) {
  if (typeof s !== 'string' || !/^0x(?:0|[1-9a-f][0-9a-f]*)$/i.test(s)) throw Error('Invalid RPC quantity');
  return BigInt(s);
}
export function parseAmount(s) {
  if (typeof s !== 'string' || !/^(0|[1-9][0-9]*)(\.[0-9]{1,18})?$/.test(s)) throw Error('Use a positive decimal USDC amount, at most 18 decimals');
  const [whole, fraction = ''] = s.split('.');
  const n = BigInt(whole) * 10n ** 18n + BigInt(fraction.padEnd(18, '0'));
  if (n <= 0n || n >= 2n ** 256n) throw Error('Amount outside supported range');
  return n;
}
export function formatAmount(n) {
  const sign = n < 0n ? '-' : '';
  const v = n < 0n ? -n : n;
  const frac = (v % 10n ** 18n).toString().padStart(18, '0').replace(/0+$/, '');
  return sign + v / 10n ** 18n + (frac ? '.' + frac : '');
}
function topicAddress(t) {
  if (typeof t !== 'string' || !/^0x0{24}[0-9a-f]{40}$/i.test(t)) throw Error('Malformed indexed address');
  return address('0x' + t.slice(-40));
}
export function summarize(receipt, { txHash, recipient, amount, sender } = {}) {
  txHash = hash(txHash);
  recipient = address(recipient);
  if (recipient === ZERO) throw Error('Zero recipient forbidden');
  if (sender !== undefined) { sender = address(sender); if (sender === ZERO) throw Error('Zero sender forbidden'); }
  const expected = parseAmount(amount);
  if (!receipt) return { status: 'NOT_FOUND_OR_PENDING', txHash };
  if (hash(receipt.transactionHash) !== txHash) throw Error('Receipt hash mismatch');
  const blockHash = hash(receipt.blockHash);
  const blockNumber = quantity(receipt.blockNumber).toString();
  const status = quantity(receipt.status);
  if (status !== 0n && status !== 1n) throw Error('Unknown transaction status');
  const fee = formatAmount(quantity(receipt.gasUsed) * quantity(receipt.effectiveGasPrice));
  if (status === 0n) return { status: 'REVERTED', txHash, blockHash, blockNumber, feeUSDC: fee };
  if (!Array.isArray(receipt.logs)) throw Error('Missing logs');
  let incoming = 0n, outgoing = 0n, matched = 0n, ignoredMirrorLogs = 0;
  const movements = [], seen = new Set();
  for (const log of receipt.logs) {
    const emitter = address(log.address);
    if (emitter !== SYSTEM && emitter !== ERC20) continue;
    if (!Array.isArray(log.topics) || log.topics[0]?.toLowerCase() !== TRANSFER) continue;
    if (log.removed === true) throw Error('Removed log in receipt');
    if (log.topics.length !== 3 || !/^0x[0-9a-f]{64}$/i.test(log.data)) throw Error('Malformed transfer log');
    if (log.transactionHash && hash(log.transactionHash) !== txHash) throw Error('Log hash mismatch');
    if (log.blockHash && hash(log.blockHash) !== blockHash) throw Error('Log block mismatch');
    const id = quantity(log.logIndex).toString();
    if (seen.has(id)) throw Error('Duplicate log index');
    seen.add(id);
    const from = topicAddress(log.topics[1]), to = topicAddress(log.topics[2]);
    if (emitter === ERC20) { ignoredMirrorLogs++; continue; }
    const value = BigInt(log.data);
    // Mint/burn and self-transfers are not invoice settlement.
    if (from === ZERO || to === ZERO || from === to || value === 0n) continue;
    if (to === recipient) { incoming += value; if (!sender || from === sender) matched += value; }
    if (from === recipient) outgoing += value;
    if (to === recipient || from === recipient) movements.push({ from, to, amountUSDC: formatAmount(value), logIndex: id });
  }
  const net = incoming - outgoing;
  // Conservative: recipient must retain the amount within this transaction.
  const paid = matched >= expected && net >= expected;
  return { schema: 'arc-receipt/v1', network: 'Arc mainnet', chainId: 5042,
    status: paid ? 'MATCHED' : 'NOT_MATCHED', txHash, blockHash, blockNumber,
    recipient, sender: sender ?? null, expectedUSDC: amount,
    incomingUSDC: formatAmount(incoming), outgoingUSDC: formatAmount(outgoing),
    netUSDC: formatAmount(net), matchingSenderUSDC: formatAmount(matched), feeUSDC: fee,
    ignoredMirrorLogs, movements,
    warning: 'RPC-backed evidence, not a cryptographic receipt proof. Not payer identity, invoice uniqueness, or a guarantee against later outgoing payments.' };
}
export async function rpc(method, params = []) {
  if (!['eth_chainId','eth_getTransactionReceipt','eth_getBlockByHash','eth_blockNumber','eth_gasPrice'].includes(method)) throw Error('Read-only RPC method required');
  const res = await fetch(RPC, { method: 'POST', headers: {'content-type':'application/json'},
    body: JSON.stringify({jsonrpc:'2.0',id:1,method,params}), signal: AbortSignal.timeout(15000) });
  if (!res.ok) throw Error('RPC HTTP ' + res.status);
  const data = await res.json();
  if (data.error || !Object.hasOwn(data, 'result')) throw Error('RPC request failed');
  return data.result;
}
export async function verify(options, call = rpc) {
  hash(options.txHash); address(options.recipient); parseAmount(options.amount);
  if (options.sender !== undefined) address(options.sender);
  if (quantity(await call('eth_chainId')) !== 5042n) throw Error('Wrong network: Arc mainnet required');
  const receipt = await call('eth_getTransactionReceipt', [options.txHash]);
  const result = summarize(receipt, options);
  if (receipt) {
    const block = await call('eth_getBlockByHash', [result.blockHash, false]);
    if (!block || hash(block.hash) !== result.blockHash || quantity(block.number).toString() !== result.blockNumber || !Array.isArray(block.transactions) || !block.transactions.some(t => typeof t === 'string' && t.toLowerCase() === result.txHash)) throw Error('Receipt block inclusion mismatch');
  }
  return result;
}
