import { rpc, quantity, formatAmount, summarize, verify } from './receipt.mjs';
import { fixture, options } from './demo.mjs';
const [command, ...args] = process.argv.slice(2);
try {
  let output;
  if (command === 'demo') output = {mode:'SYNTHETIC_DEMO_NOT_ONCHAIN', ...summarize(fixture(),options)};
  else if (command === 'health') {
    const chain = quantity(await rpc('eth_chainId'));
    if (chain !== 5042n) throw Error('Wrong chain');
    const [block, price] = await Promise.all([rpc('eth_blockNumber'),rpc('eth_gasPrice')]);
    output = {chainId:Number(chain),block:quantity(block).toString(),gasPriceAtomicUSDC:quantity(price).toString(), example21000GasUSDC:formatAmount(quantity(price)*21000n), note:'Read-only network check; example is not a deployment quote'};
  } else if (command === 'verify' && (args.length === 3 || args.length === 4)) {
    output = await verify({txHash:args[0],recipient:args[1],amount:args[2],...(args[3] ? {sender:args[3]} : {})});
    if (output.status !== 'MATCHED') process.exitCode = 2;
  } else throw Error('Usage: node cli.mjs demo | health | verify TX_HASH RECIPIENT USDC_AMOUNT [SENDER]');
  console.log(JSON.stringify(output,null,2));
} catch(e) { console.error('ArcReceipt: '+e.message); process.exitCode=1; }
