import { JsonRpcProvider, Wallet, ContractFactory } from "ethers";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const provider = new JsonRpcProvider("http://127.0.0.1:8545");
  const signer = new Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", provider);

  console.log("Déploiement avec le compte :", signer.address);

  // 1. Déploiement de SemaphoreMock
  const mockPath = path.resolve("./artifacts/contracts/SemaphoreMock.sol/SemaphoreMock.json");
  if (!fs.existsSync(mockPath)) {
    throw new Error("Artéfact SemaphoreMock introuvable. Exécutez 'npx hardhat compile' d'abord.");
  }
  const mockFile = JSON.parse(fs.readFileSync(mockPath, "utf8"));
  const mockAbi = mockFile.abi || mockFile.default?.abi;
  let mockBytecode = mockFile.bytecode || mockFile.default?.bytecode;
  if (typeof mockBytecode === "object" && mockBytecode !== null) mockBytecode = mockBytecode.object || mockBytecode.raw;

  const mockFactory = new ContractFactory(mockAbi, mockBytecode, signer);
  console.log("Déploiement de SemaphoreMock...");
  const semaphoreMock = await mockFactory.deploy();
  await semaphoreMock.waitForDeployment();
  const semaphoreAddress = await semaphoreMock.getAddress();
  console.log("SemaphoreMock déployé à l'adresse :", semaphoreAddress);

  // 2. Déploiement de Voting.sol avec l'adresse du Mock
  const votingPath = path.resolve("./artifacts/contracts/Voting.sol/Voting.json");
  if (!fs.existsSync(votingPath)) {
    throw new Error("Artéfact Voting introuvable. Exécutez 'npx hardhat compile' d'abord.");
  }
  const votingFile = JSON.parse(fs.readFileSync(votingPath, "utf8"));
  const votingAbi = votingFile.abi || votingFile.default?.abi;
  let votingBytecode = votingFile.bytecode || votingFile.default?.bytecode;
  if (typeof votingBytecode === "object" && votingBytecode !== null) votingBytecode = votingBytecode.object || votingBytecode.raw;

  const votingFactory = new ContractFactory(votingAbi, votingBytecode, signer);
  console.log("Déploiement de Voting.sol...");
  const voting = await votingFactory.deploy(semaphoreAddress);
  await voting.waitForDeployment();

  const votingAddress = await voting.getAddress();
  console.log("--------------------------------------------------");
  console.log("SUCCÈS_CONTRAT_ADRESSE:", votingAddress);
  console.log("--------------------------------------------------");
}

main().catch((error) => {
  console.error("ERREUR DEPLOIEMENT:", error);
  process.exitCode = 1;
});