export const CHAIN='0x13b2';
export function money(n){const s=n.toString().padStart(19,'0');return s.slice(0,-18)+'.'+s.slice(-18).replace(/0+$/,'');}
export function buildQuote(estimate,price){
  const gas=(BigInt(estimate)*120n+99n)/100n;
  const floor=20000000000n;
  const p=BigInt(price)>floor?BigInt(price):floor;
  const maxFee=p*2n;
  if(gas<=0n||maxFee*gas>100000000000000000n)throw Error('배포 수수료 상한이 0.1 USDC를 넘습니다. 배포를 중단합니다.');
  return {gas:'0x'+gas.toString(16),maxFeePerGas:'0x'+maxFee.toString(16),maxPriorityFeePerGas:'0x0',cap:money(gas*maxFee)};
}
export function transaction(account,bytecode,q){
  if(!/^0x[0-9a-f]{40}$/i.test(account)||!/^0x(?:[0-9a-f]{2})+$/i.test(bytecode))throw Error('Invalid deployment input');
  const checked=BigInt(q.gas)*BigInt(q.maxFeePerGas);
  if(checked<=0n||checked>100000000000000000n)throw Error('Fee cap exceeded');
  return {from:account,data:bytecode,value:'0x0',chainId:CHAIN,gas:q.gas,maxFeePerGas:q.maxFeePerGas,maxPriorityFeePerGas:'0x0'};
}
