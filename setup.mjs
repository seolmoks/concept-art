import fs from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {spawn} from 'node:child_process';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import readline from 'node:readline';
process.chdir(fileURLToPath(new URL('.',import.meta.url)));
async function ask(label,secret=false){
 if(!process.stdin.isTTY)throw Error('브라우저 작업 공간의 터미널에서 실행하세요.');
 if(!secret){const rl=readline.createInterface({input:process.stdin,output:process.stdout});try{return await new Promise(r=>rl.question(label,r))}finally{rl.close()}}
 process.stdout.write(label);process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
 return new Promise((resolve,reject)=>{let value='';const end=()=>{process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\n')};const onData=data=>{for(const ch of data){if(ch==='\u0003'){end();reject(Error('취소했습니다.'));return}if(ch==='\r'||ch==='\n'){end();resolve(value);return}if(ch==='\u007f'||ch==='\b'){value=Array.from(value).slice(0,-1).join('')}else if(ch>=' ')value+=ch}};process.stdin.on('data',onData)});
}
async function run(args,env,input){await new Promise((resolve,reject)=>{
 const child=spawn(process.execPath,['node_modules/wrangler/bin/wrangler.js',...args],{env,stdio:[input===undefined?'inherit':'pipe','inherit','inherit']});
 if(input!==undefined)child.stdin.end(input);
 child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(Error('설정 작업이 중단되었습니다. 위 오류를 확인하세요.')));
})}
async function main(){
 console.log('컨셉아트 아카이브 — Cloudflare 이전용 설치\n기존 Sites 작품/이미지 데이터는 이 파일에 포함되지 않습니다.\nCloudflare에서 빈 D1 데이터베이스 concept-art-db와 R2 버킷 concept-art-images를 먼저 만드세요.\nR2는 별도 활성화가 필요하며 무료 사용량 초과 시 비용이 발생할 수 있습니다.\n이 작업은 www Worker를 갤러리로 교체하고 관리자 비밀번호를 설정합니다.');
 const account=(await ask('Cloudflare Account ID: ')).trim();
 const db=(await ask('새 D1 데이터베이스 UUID: ')).trim();
 if(!/^[a-f0-9]{32}$/i.test(account)||!/^[a-f0-9-]{36}$/i.test(db))throw Error('Account ID 또는 D1 UUID 형식을 확인하세요.');
 const token=(await ask('Cloudflare API 토큰 (화면에 표시되지 않음): ',true)).trim();
 if(!token)throw Error('API 토큰이 필요합니다.');
 const username=(await ask('사이트 관리자 아이디: ')).trim();
 const password=await ask('사이트 관리자 비밀번호 (화면에 표시되지 않음): ',true);
 const confirm=await ask('비밀번호 다시 입력: ',true);
 if(!username||username.length>80||password.length<10||password.length>256||password!==confirm)throw Error('아이디와 비밀번호를 확인하세요. 비밀번호는 10~256자이며 두 입력이 같아야 합니다.');
 const approved=(await ask('선택한 계정의 www 사이트를 갤러리로 교체하려면 배포 를 입력: ')).trim();
 if(approved!=='배포'){console.log('변경하지 않고 종료했습니다.');return}
 const cfg=JSON.parse(await fs.readFile('wrangler.json','utf8'));cfg.account_id=account;cfg.d1_databases[0].database_id=db;
 await fs.writeFile('wrangler.json',JSON.stringify(cfg,null,2)+'\n');
 const env={...process.env,CLOUDFLARE_ACCOUNT_ID:account,CLOUDFLARE_API_TOKEN:token,WRANGLER_SEND_METRICS:'false',WRANGLER_LOG_SANITIZE:'true'};
 await run(['d1','migrations','apply','DB','--remote','--config','wrangler.json'],env);
 const salt=randomBytes(16);const hash=salt.toString('base64url')+'.'+pbkdf2Sync(password,salt,100000,32,'sha256').toString('base64url');
 await run(['secret','bulk','--config','wrangler.json'],env,JSON.stringify({ADMIN_USERNAME:username,ADMIN_PASSWORD_HASH:hash,ADMIN_SESSION_SECRET:randomBytes(32).toString('base64url')}));
 await run(['deploy','--config','wrangler.json'],env);
 console.log('\n배포 완료. 위에 표시된 주소에서 로그인 → 작품 등록 → 로그아웃 후 공개 작품 확인을 진행하세요.\nAI 기능은 OPENAI_API_KEY를 별도로 연결하기 전까지 비활성 상태입니다.\n작업 종료 후 Codespaces를 중지하고, 일회용 배포 토큰은 Cloudflare에서 폐기하세요.');
}
main().catch(error=>{console.error(error.message);process.exitCode=1});
