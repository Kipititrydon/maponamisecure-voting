import { ethers } from "ethers";

// Définition minimale de l'ABI de votre contrat Voting
const votingAbi = [
  "function addCandidate(uint256 _candidateId, string memory _name) public",
  "function candidates(uint256) public view returns (uint256 id, string memory name, uint256 voteCount)"
];

async function main() {
  // 1. Connexion au nœud local Hardhat
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  
  // 2. Utilisation du premier compte Hardhat pour signer les transactions
  const signer = await provider.getSigner(0);

  const contractAddress = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
  const voting = new ethers.Contract(contractAddress, votingAbi, signer);

  const candidatesList = [
    { id: 1, name: "JEANNETE" },
    { id: 2, name: "GRACE" },
    { id: 3, name: "JUREL" },
    { id: 4, name: "JACKSON" },
    { id: 5, name: "TRYDON" },
  ];

  console.log("Enregistrement des 5 candidats sur le contrat local...");

  for (const candidate of candidatesList) {
    try {
      const tx = await voting.addCandidate(candidate.id, candidate.name);
      await tx.wait();
      console.log(`Candidat ${candidate.id} (${candidate.name}) ajouté avec succès !`);
    } catch (error: any) {
      console.log(`Note/Ignoré pour ${candidate.name}: ${error.message}`);
    }
  }

  console.log("Enregistrement terminé !");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});