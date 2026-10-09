const Voting = artifacts.require('Voting');
const VoterIdentityNFT = artifacts.require('VoterIdentityNFT');

async function expectRevert(promise, reason) {
  try { await promise; assert.fail('Expected transaction to revert'); }
  catch (error) { assert(error.message.includes(reason), `Expected "${reason}", got: ${error.message}`); }
}

contract('Proof-To-Vote security', accounts => {
  const [admin, voter1, voter2] = accounts;
  let identity, voting;

  beforeEach(async () => {
    identity = await VoterIdentityNFT.new({from: admin});
    voting = await Voting.new(identity.address, {from: admin});
    await voting.addCandidate('Candidate One', 'Engineering', {from: admin});
  });

  it('allows only the admin wallet to manage candidates, dates, and NFTs', async () => {
    const now = (await web3.eth.getBlock('latest')).timestamp;
    await expectRevert(voting.addCandidate('Fake', 'List', {from:voter1}), 'Only admin');
    await expectRevert(voting.setDates(now + 10, now + 100, {from:voter1}), 'Only admin');
    await expectRevert(identity.mint(voter1, 'student-id://1', {from:voter2}), 'Only admin');
  });

  it('blocks voting without an NFT and from a wrong wallet', async () => {
    const now = (await web3.eth.getBlock('latest')).timestamp;
    await voting.setDates(now, now + 1000, {from:admin});
    await identity.mint(voter1, 'student-id://1', {from:admin});
    await expectRevert(voting.vote(1, {from:voter2}), 'No voter NFT');
  });

  it('blocks voting before start, permits a date correction, and then permits one vote', async () => {
    await identity.mint(voter1, 'student-id://1', {from:admin});
    const now = (await web3.eth.getBlock('latest')).timestamp;
    await voting.setDates(now + 500, now + 1000, {from:admin});
    await expectRevert(voting.vote(1, {from:voter1}), 'Voting has not started');
    const current = (await web3.eth.getBlock('latest')).timestamp;
    await voting.setDates(current, current + 1000, {from:admin});
    await voting.vote(1, {from:voter1});
    assert.equal((await voting.totalVotes()).toString(), '1');
    await expectRevert(voting.vote(1, {from:voter1}), 'already voted');
  });

  it('rejects invalid candidates and locks election setup after start', async () => {
    await identity.mint(voter1, 'student-id://1', {from:admin});
    const now = (await web3.eth.getBlock('latest')).timestamp;
    await voting.setDates(now, now + 1000, {from:admin});
    await expectRevert(voting.vote(999, {from:voter1}), 'Invalid candidate');
    await expectRevert(voting.addCandidate('Late', 'List', {from:admin}), 'Election already started');
    await expectRevert(voting.setDates(now + 10, now + 2000, {from:admin}), 'Election already started');
  });

  it('makes voter identity NFTs non-transferable and unique', async () => {
    await identity.mint(voter1, 'student-id://1', {from:admin});
    await expectRevert(identity.mint(voter1, 'student-id://again', {from:admin}), 'already has');
    await expectRevert(identity.transferFrom(voter1, voter2, 1, {from:voter1}), 'non-transferable');
  });
});
