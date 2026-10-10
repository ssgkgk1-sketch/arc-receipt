import test from 'node:test';import assert from 'node:assert/strict';import {buildQuote,transaction} from '../web/policy.mjs';
test('fee margin and minimum',()=>{const q=buildQuote('0x64','0x1');assert.equal(BigInt(q.gas),120n);assert.equal(BigInt(q.maxFeePerGas),40000000000n);});
test('expensive deployment blocked',()=>assert.throws(()=>buildQuote('0xffffff','0xffffffffff')));
test('no recipient or transferred funds',()=>{const q=buildQuote('0x259df','0x4a817c800');const t=transaction('0x'+'1'.repeat(40),'0x1234',q);assert.equal(t.value,'0x0');assert.equal(t.chainId,'0x13b2');assert.equal(t.to,undefined);});
test('invalid bytecode rejected',()=>assert.throws(()=>transaction('0x'+'1'.repeat(40),'0x1',buildQuote('0x64','0x1'))));
