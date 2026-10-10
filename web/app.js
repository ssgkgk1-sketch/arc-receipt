import {CHAIN,buildQuote,transaction,money} from './policy.mjs';
const $=id=>document.getElementById(id);
let provider,account,quote,artifact,busy=false;
const providers=new Map();
const storageKey='arcreceipt-deployment-v1';
let sent=localStorage.getItem(storageKey);
function message(s){$('message').textContent=s;}
function refresh(){$('connect').disabled=busy;$('estimate').disabled=busy||!account||!!sent;$('deploy').disabled=busy||!quote||!$('consent').checked||!!sent;$('check').hidden=!sent;$('check').disabled=busy;}
function invalidate(){quote=null;$('consent').checked=false;$('quote').textContent='계정/네트워크 변경됨. 비용을 다시 조회하세요.';refresh();}
async function run(fn){if(busy)return;busy=true;refresh();try{await fn();}catch(e){message(e.code===4001?'지갑 요청을 취소했습니다.':String(e.message||e));}finally{busy=false;refresh();}}
window.addEventListener('eip6963:announceProvider',e=>{if(e.detail?.info?.rdns==='io.rabby')providers.set(e.detail.info.uuid,e.detail.provider);});
window.dispatchEvent(new Event('eip6963:requestProvider'));
$('consent').onchange=refresh;
$('connect').onclick=()=>run(async()=>{
  provider=[...providers.values()][0]||window.ethereum?.providers?.find(p=>p.isRabby)||(window.ethereum?.isRabby?window.ethereum:null);
  if(!provider)throw Error('Rabby가 감지되지 않았습니다. Rabby 확장 프로그램이 있는 Chrome/Edge에서 http://127.0.0.1:5190/ 를 여세요.');
  const accounts=await provider.request({method:'eth_requestAccounts'});account=accounts[0];
  if(!account)throw Error('선택한 계정이 없습니다.');
  $('account').textContent=account;
  if(!provider.__arcReceiptListeners){provider.on?.('accountsChanged',a=>{account=a[0];$('account').textContent=account||'연결 해제';invalidate();});provider.on?.('chainChanged',invalidate);provider.__arcReceiptListeners=true;}
  message(sent?'이 브라우저에서 이미 배포 거래를 제출했습니다. 상태를 확인하세요.':'연결되었습니다. 다음으로 비용을 조회하세요.');
});
$('estimate').onclick=()=>run(async()=>{
  invalidate();
  try{await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:CHAIN}]});}
  catch(e){if(e.code!==4902)throw e;await provider.request({method:'wallet_addEthereumChain',params:[{chainId:CHAIN,chainName:'Arc',nativeCurrency:{name:'USDC',symbol:'USDC',decimals:18},rpcUrls:['https://rpc.mainnet.arc.io'],blockExplorerUrls:['https://explorer.arc.io']}]});await provider.request({method:'wallet_switchEthereumChain',params:[{chainId:CHAIN}]});}
  if((await provider.request({method:'eth_chainId'})).toLowerCase()!==CHAIN)throw Error('Arc 네트워크 전환을 확인할 수 없습니다.');
  const a=(await provider.request({method:'eth_accounts'}))[0];if(a?.toLowerCase()!==account?.toLowerCase())throw Error('계정이 변경되었습니다. 다시 연결하세요.');
  const res=await fetch('/artifact.json');if(!res.ok)throw Error('빌드 파일을 읽지 못했습니다.');artifact=await res.json();
  const gas=await provider.request({method:'eth_estimateGas',params:[{from:a,data:artifact.bytecode,value:'0x0'}]});
  const price=await provider.request({method:'eth_gasPrice'});
  const q=buildQuote(gas,price);
  const balance=BigInt(await provider.request({method:'eth_getBalance',params:[a,'latest']}));
  if(balance<BigInt(q.gas)*BigInt(q.maxFeePerGas))throw Error('Arc USDC 잔액이 수수료 상한보다 부족합니다. 아직 서명하지 마세요.');
  quote={...q,account:a,created:Date.now()};
  $('quote').textContent=`계정: ${a}\n추정 가스: ${BigInt(gas)}\n현재 가격 기준 예상: ${money(BigInt(gas)*BigInt(price))} USDC\n여유분 포함 최대 수수료: ${q.cap} USDC\nArc 잔액: ${money(balance)} USDC\n견적 유효 시간: 60초`;
  message('견적을 확인한 뒤 체크박스를 선택하세요. 다음 버튼은 Rabby의 배포 검토창을 엽니다.');
});
$('deploy').onclick=()=>run(async()=>{
  if(!quote||!$('consent').checked||sent)throw Error('새 견적과 동의가 필요합니다.');
  if(Date.now()-quote.created>60000){invalidate();throw Error('견적이 만료되었습니다. 비용을 다시 조회하세요.');}
  const a=(await provider.request({method:'eth_accounts'}))[0];
  if(a?.toLowerCase()!==quote.account.toLowerCase()||(await provider.request({method:'eth_chainId'})).toLowerCase()!==CHAIN){invalidate();throw Error('계정 또는 체인이 변경되었습니다.');}
  const tx=transaction(a,artifact.bytecode,quote);
  message('Rabby에서 새 계약 배포·송금액 0·수수료를 직접 검토하세요. 의심스러우면 거절하세요.');
  const h=await provider.request({method:'eth_sendTransaction',params:[tx]});
  if(!/^0x[0-9a-f]{64}$/i.test(h))throw Error('거래 해시 응답을 확인하지 못했습니다. 재배포하지 말고 지갑 기록을 확인하세요.');
  sent=h;quote=null;localStorage.setItem(storageKey,h);message('거래 제출됨: '+h+'\n거래 상태 확인을 눌러주세요. 중복 배포는 차단했습니다.');
});
$('check').onclick=()=>run(async()=>{
  if(!provider)throw Error('먼저 Rabby를 연결하세요.');
  if((await provider.request({method:'eth_chainId'})).toLowerCase()!==CHAIN)throw Error('Rabby에서 Arc 네트워크를 선택하세요.');
  const r=await provider.request({method:'eth_getTransactionReceipt',params:[sent]});
  if(!r){message('아직 영수증이 없습니다. 재배포하지 말고 잠시 후 다시 조회하세요.');return;}
  if(r.status!=='0x1'||!r.contractAddress){message('배포 성공을 확인하지 못했습니다. 거래: '+sent);return;}
  message('배포 성공 · 계약 주소: '+r.contractAddress+'\n거래: '+sent+'\n이 주소를 대화에 보내주세요. 보상 신청은 아직 완료되지 않았습니다.');
  const a=document.createElement('a');a.href='https://explorer.arc.io/tx/'+sent;a.textContent='Arc 탐색기에서 확인';a.target='_blank';a.rel='noopener noreferrer';$('result').replaceChildren(a);
});
if(sent)message('이전에 제출한 거래: '+sent+'\n지갑 연결 후 거래 상태를 확인하세요.');refresh();
