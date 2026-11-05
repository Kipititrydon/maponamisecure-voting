// SPDX-License-Identifier: MIT
import "@semaphore-protocol/contracts/interfaces/ISemaphore.sol";

contract Voting {
    ISemaphore public immutable semaphore;

    uint256 public groupId;
    address public admin;

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
    }

    mapping(uint256 => Candidate) public candidates;
    uint256 public candidatesCount;

    // Mapping pour retrouver l'ID d'un candidat à partir de son nom exact
    mapping(string => uint256) public candidateNameToId;

    mapping(uint256 => bool) public nullifierHashes;

    event CandidateAdded(uint256 indexed candidateId, string name);
    event VoteCast(uint256 indexed candidateId, uint256 nullifierHash);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Seul l'administrateur peut effectuer cette action");
        _;
    }

    constructor(address _semaphoreAddress) {
        semaphore = ISemaphore(_semaphoreAddress);
        admin = msg.sender;
        groupId = semaphore.createGroup(admin);
    }

    function registerVoter(uint256 identityCommitment) external onlyAdmin {
        semaphore.addMember(groupId, identityCommitment);
    }

    function addCandidate(string memory _name) external onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        candidateNameToId[_name] = candidatesCount;
        emit CandidateAdded(candidatesCount, _name);
    }

    function castVote(
        uint256 candidateId,
        uint256 merkleTreeRoot,
        uint256 nullifierHash,
        uint256[8] calldata proof
    ) external {
        require(candidateId > 0 && candidateId <= candidatesCount, "Candidat invalide");
        require(!nullifierHashes[nullifierHash], "Ce vote a deja ete effectue");

        ISemaphore.SemaphoreProof memory semaphoreProof = ISemaphore.SemaphoreProof({
            merkleTreeDepth: 20,
            merkleTreeRoot: merkleTreeRoot,
            nullifier: nullifierHash,
            message: candidateId,
            scope: groupId,
            points: proof
        });

        semaphore.validateProof(groupId, semaphoreProof);

        nullifierHashes[nullifierHash] = true;
        candidates[candidateId].voteCount++;

        emit VoteCast(candidateId, nullifierHash);
    }
}