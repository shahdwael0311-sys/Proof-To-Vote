const Web3 = require('web3');
const votingArtifact = require('../../build/contracts/Voting.json');
const identityArtifact = require('../../build/contracts/VoterIdentityNFT.json');
const API = 'http://127.0.0.1:8000';
const token = localStorage.getItem('ptvToken');
const auth = {'Authorization': `Bearer ${token}`};
let account, voting, identity, selectedCandidate, profile;
let web3;

const statusBox = document.getElementById('status');
const setStatus = (text, type='') => { statusBox.textContent = text; statusBox.className = `notice ${type}`; };
document.getElementById('logout').onclick = () => { localStorage.clear(); location.href='/login'; };

async function start() {
  try {
    if (!token) throw new Error('Login required');
    let response = await fetch(`${API}/me`, {headers:auth});
    if (!response.ok) throw new Error('Your login has expired');
    profile = await response.json();
    if (!window.ethereum) throw new Error('MetaMask is required. Connect it to Ganache on port 7545.');
    const accounts = await window.ethereum.request({method:'eth_requestAccounts'});
    account = accounts[0].toLowerCase();
    document.getElementById('accountAddress').textContent = account;
    if (!profile.wallet_address || account !== profile.wallet_address.toLowerCase()) throw new Error(`Wrong wallet. Select the wallet registered to ${profile.voter_id}.`);
    web3 = new Web3(window.ethereum); const networkId = await web3.eth.net.getId();
    if (!votingArtifact.networks[networkId] || !identityArtifact.networks[networkId]) throw new Error('Contracts are not deployed to this Ganache network. Run truffle migrate --reset.');
    voting = new web3.eth.Contract(votingArtifact.abi, votingArtifact.networks[networkId].address);
    identity = new web3.eth.Contract(identityArtifact.abi, identityArtifact.networks[networkId].address);
    await renderCandidates();
    const dates = await voting.methods.getDates().call(); const startAt=Number(dates[0]), endAt=Number(dates[1]), now=Math.floor(Date.now()/1000);
    document.getElementById('dates').textContent = startAt ? `${new Date(startAt*1000).toLocaleString()} — ${new Date(endAt*1000).toLocaleString()}` : 'Not scheduled';
    const tokenId = Number(await identity.methods.tokenOf(account).call());
    const hasNft = tokenId > 0 && Number(await identity.methods.balanceOf(account).call()) === 1;
    const voted = await voting.methods.voters(account).call();
    if (voted) { setStatus('You have already voted. Your ballot cannot be submitted twice.', 'success'); showPrevious(); return; }
    if (!hasNft) throw new Error('No voter NFT found. Ask the admin to mint it after KYC approval.');
    if (!startAt || now < startAt) throw new Error('Voting has not started. The vote button stays disabled.');
    if (now >= endAt) throw new Error('Voting has ended.');
    setStatus(`Identity NFT #${tokenId} verified on-chain. Choose one candidate and submit your vote.`, 'success');
  } catch (error) { setStatus(error.message, 'error'); }
}

async function renderCandidates() {
  const count=Number(await voting.methods.getCountCandidates().call()); const grid=document.getElementById('candidateGrid'); grid.innerHTML='';
  for(let i=1;i<=count;i++){const c=await voting.methods.getCandidate(i).call(); const label=document.createElement('label'); label.className='candidate-card'; label.innerHTML=`<input type="radio" name="candidate" value="${c[0]}"><h2>${escapeHtml(c[1])}</h2><p>${escapeHtml(c[2])}</p>`; label.querySelector('input').onchange=()=>{selectedCandidate=Number(c[0]);document.getElementById('voteButton').disabled=false;}; grid.appendChild(label);}
  if(!count) grid.innerHTML='<p>No candidates have been added yet.</p>';
}

document.getElementById('voteButton').onclick = async () => {
  if(!selectedCandidate) return; const button=document.getElementById('voteButton'); button.disabled=true; setStatus('Confirm the transaction in MetaMask…');
  try {
    const result=await voting.methods.vote(selectedCandidate).send({from:account,gas:6654755}); const txHash=result.transactionHash;
    const proofHash=Web3.utils.soliditySha3(txHash,account,String(selectedCandidate)); const proofUri=`local-proof://${proofHash}`;
    const response=await fetch(`${API}/audit`,{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({wallet_address:account,candidate_id:selectedCandidate,proof_hash:proofHash,proof_uri:proofUri,tx_hash:txHash})});
    const audit=await response.json(); if(!response.ok) throw new Error(`Vote succeeded on-chain, but audit save failed: ${audit.detail}`);
    setStatus('Vote confirmed on the blockchain.', 'success'); showReceipt(txHash,proofHash,proofUri);
  } catch(error){setStatus(error.message,'error');button.disabled=false;}
};

async function showPrevious(){const id=Number(await voting.methods.votedCandidate(account).call()); const records=await fetch(`${API}/audit`).then(r=>r.json()).catch(()=>[]); const proof=records.find(x=>x.wallet_address.toLowerCase()===account); showReceipt(proof?.tx_hash||'Recorded on-chain',proof?.proof_hash||'Available in the audit trail',proof?.proof_uri||'',id);}
function showReceipt(tx,hash,uri,id=selectedCandidate){const box=document.getElementById('receipt');box.className='receipt';box.innerHTML=`<h2>Vote receipt</h2><p>Candidate ID: <b>${id}</b></p><p>Transaction: <span class="mono">${tx}</span></p><p>Proof hash: <span class="mono">${hash}</span></p><p>Proof URI: ${uri}</p>`;}
function escapeHtml(value){const node=document.createElement('div');node.textContent=value;return node.innerHTML;}
window.ethereum?.on('accountsChanged',()=>location.reload());
start();
