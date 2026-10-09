pragma solidity ^0.5.15;

/**
 * A deliberately small, non-transferable voter identity token. It exposes the
 * familiar ERC-721 ownership functions needed by the application, but transfer
 * functions always revert: a student identity must never be sold or moved.
 */
contract VoterIdentityNFT {
    string public name = "Proof-To-Vote Student Identity";
    string public symbol = "PTV-ID";
    address public owner;
    uint256 public totalSupply;

    mapping(uint256 => address) private tokenOwners;
    mapping(address => uint256) private ownedToken;
    mapping(uint256 => string) private tokenUris;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin can perform this action");
        _;
    }

    constructor() public { owner = msg.sender; }

    function mint(address voter, string memory uri) public onlyOwner returns (uint256) {
        require(voter != address(0), "Invalid wallet");
        require(ownedToken[voter] == 0, "Wallet already has voter NFT");
        totalSupply++;
        tokenOwners[totalSupply] = voter;
        ownedToken[voter] = totalSupply;
        tokenUris[totalSupply] = uri;
        emit Transfer(address(0), voter, totalSupply);
        return totalSupply;
    }

    function balanceOf(address voter) public view returns (uint256) {
        return ownedToken[voter] == 0 ? 0 : 1;
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        require(tokenOwners[tokenId] != address(0), "Unknown token");
        return tokenOwners[tokenId];
    }

    function tokenOf(address voter) public view returns (uint256) { return ownedToken[voter]; }
    function tokenURI(uint256 tokenId) public view returns (string memory) { return tokenUris[tokenId]; }

    function transferFrom(address, address, uint256) public pure { revert("Voter NFT is non-transferable"); }
    function safeTransferFrom(address, address, uint256) public pure { revert("Voter NFT is non-transferable"); }
}

contract Voting {
    struct Candidate { uint id; string name; string party; uint voteCount; }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;
    mapping(address => uint) public votedCandidate;

    address public owner;
    VoterIdentityNFT public voterIdentity;
    uint public countCandidates;
    uint public totalVotes;
    uint256 public votingStart;
    uint256 public votingEnd;

    event CandidateAdded(uint indexed candidateId, string name, string party);
    event VotingDatesUpdated(uint256 startDate, uint256 endDate);
    event VoteCast(address indexed voter, uint indexed candidateId, uint256 timestamp);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only admin can perform this action");
        _;
    }

    constructor(address identityAddress) public {
        owner = msg.sender;
        voterIdentity = VoterIdentityNFT(identityAddress);
    }

    function addCandidate(string memory name, string memory party) public onlyOwner returns (uint) {
        require(votingStart == 0 || now < votingStart, "Election already started");
        require(bytes(name).length > 0 && bytes(party).length > 0, "Candidate fields required");
        countCandidates++;
        candidates[countCandidates] = Candidate(countCandidates, name, party, 0);
        emit CandidateAdded(countCandidates, name, party);
        return countCandidates;
    }

    function vote(uint candidateID) public {
        require(votingStart > 0 && now >= votingStart, "Voting has not started");
        require(now < votingEnd, "Voting has ended");
        require(candidateID > 0 && candidateID <= countCandidates, "Invalid candidate");
        require(voterIdentity.balanceOf(msg.sender) == 1, "No voter NFT found");
        require(!voters[msg.sender], "Wallet has already voted");
        voters[msg.sender] = true;
        votedCandidate[msg.sender] = candidateID;
        candidates[candidateID].voteCount++;
        totalVotes++;
        emit VoteCast(msg.sender, candidateID, now);
    }

    function checkVote() public view returns (bool) { return voters[msg.sender]; }
    function getCountCandidates() public view returns (uint) { return countCandidates; }

    function getCandidate(uint candidateID) public view returns (uint, string memory, string memory, uint) {
        require(candidateID > 0 && candidateID <= countCandidates, "Invalid candidate");
        Candidate storage candidate = candidates[candidateID];
        return (candidate.id, candidate.name, candidate.party, candidate.voteCount);
    }

    // Dates can be corrected repeatedly before the currently configured start.
    // Once voting starts, both candidates and dates are permanently locked.
    function setDates(uint256 startDate, uint256 endDate) public onlyOwner {
        require(votingStart == 0 || now < votingStart, "Election already started");
        require(endDate > now, "End must be in the future");
        require(endDate > startDate, "End must be after start");
        votingStart = startDate;
        votingEnd = endDate;
        emit VotingDatesUpdated(startDate, endDate);
    }

    function getDates() public view returns (uint256, uint256) { return (votingStart, votingEnd); }
}
