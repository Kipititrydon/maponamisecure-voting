import { JsonRpcProvider, Wallet, Contract } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  const signer = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

  const votingAddress = "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
  const artifactPath = path.resolve("./artifacts/contracts/Voting.sol/Voting.json");
  const fileData = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  const abi = fileData.abi || fileData.default?.abi;

  const voting = new Contract(votingAddress, abi, signer);

  // Enregistrement de l'engagement du votant dans le groupe Semaphore du contrat
  const commitment = 1464778289116505532237024153651539016454087013764399414675977907886021984316n;
  console.log("Enregistrement du votant dans le contrat...");
  const tx = await voting.registerVoter(commitment);
  await tx.wait();
  console.log("Votant enregistré avec succès !");
}

main().catch((error) => {
  console.error("Erreur:", error);
  process.exitCode = 1;
});