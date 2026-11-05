import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ethers } from 'ethers';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 4000;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_URL);
const relayerPrivateKey = process.env.RELAYER_PRIVATE_KEY || '';
const wallet = new ethers.Wallet(relayerPrivateKey, provider);

const VOTING_CONTRACT_ADDRESS = process.env.VOTING_CONTRACT_ADDRESS || '';

const VOTING_ABI = [
  'function castVote(uint256 candidateId, uint256 merkleTreeRoot, uint256 nullifierHash, uint256[8] calldata proof) external'
];

const votingContract = new ethers.Contract(VOTING_CONTRACT_ADDRESS, VOTING_ABI, wallet);

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Relayeur ZK-Voting operationnel', network: 'Sepolia' });
});

app.post('/api/relay-vote', async (req: Request, res: Response) => {
  try {
    const { candidateId, merkleTreeRoot, nullifierHash, proof } = req.body;

    if (!candidateId || !merkleTreeRoot || !nullifierHash || !proof) {
      return res.status(400).json({ error: 'Parametres de vote manquants' });
    }

    console.log('Reception d une demande de vote...');

    const tx = await votingContract.castVote(
      candidateId,
      merkleTreeRoot,
      nullifierHash,
      proof
    );

    console.log('Transaction envoyee :', tx.hash);
    
    const receipt = await tx.wait();

    return res.status(200).json({
      success: true,
      message: 'Vote enregistre avec succes !',
      txHash: receipt.hash
    });

  } catch (error: any) {
    console.error('Erreur :', error);
    return res.status(500).json({
      success: false,
      error: error.reason || error.message || 'Erreur interne'
    });
  }
});

app.listen(PORT, () => {
  console.log('Relayeur demarre sur le port ' + PORT);
});
