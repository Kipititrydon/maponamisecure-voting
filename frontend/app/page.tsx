"use client";

import { useState } from "react";

export default function Home() {
  const [identitySecret, setIdentitySecret] = useState<string>("");
  const [identityCommitment, setIdentityCommitment] = useState<string>("");
  const [selectedCandidateId, setSelectedCandidateId] = useState<number>(1);
  const [status, setStatus] = useState<string>("");

  // Liste des 5 candidats officiels
  const candidates = [
    { id: 1, name: "JEANNETE" },
    { id: 2, name: "GRACE" },
    { id: 3, name: "JUREL" },
    { id: 4, name: "JACKSON" },
    { id: 5, name: "TRYDON" },
  ];

  const handleCreateIdentity = async () => {
    try {
      setStatus("Génération de l'identité...");
      const { Identity } = await import("@semaphore-protocol/identity");
      
      const identity = new Identity();
      const secret = identity.toString();
      const commitment = identity.commitment.toString();

      setIdentitySecret(secret);
      setIdentityCommitment(commitment);
      setStatus("Identité anonyme FIMAKIKUTSHI générée avec succès ! Conservez votre secret en lieu sûr.");
    } catch (error: any) {
      console.error(error);
      setStatus("Erreur lors de la création de l'identité : " + error.message);
    }
  };

  const handleVote = async () => {
    try {
      if (!identitySecret) {
        alert("Veuillez d'abord générer votre identité FIMAKIKUTSHI WALLET !");
        return;
      }

      const currentCandidate = candidates.find(c => c.id === selectedCandidateId);
      const candidateName = currentCandidate ? currentCandidate.name : "Inconnu";

      setStatus("Génération de la preuve ZK en cours...");

      const { Identity } = await import("@semaphore-protocol/identity");
      const { Group } = await import("@semaphore-protocol/group");
      const { generateProof } = await import("@semaphore-protocol/proof");

      const identity = new Identity(identitySecret);
      const group = new Group([identity.commitment]);

      // Dans Semaphore v4, le paramètre 'scope' correspond au contexte/session (ex: group.root)
      const scope = group.root;

      const proof = await generateProof(identity, group, selectedCandidateId, scope);

      setStatus("Envoi de la preuve au relayeur...");

      const response = await fetch("http://localhost:4000/api/relay-vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateId: selectedCandidateId,
          candidateName: candidateName,
          merkleTreeRoot: proof.merkleTreeRoot.toString(),
          nullifierHash: proof.nullifier.toString(),
          proof: proof.points
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus(`Succès ! Votre vote pour "${candidateName}" a été enregistré via MAPONAMISECURE.`);
      } else {
        setStatus("Erreur : " + data.error);
      }

    } catch (error: any) {
      console.error(error);
      setStatus("Erreur lors du vote : " + error.message);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 bg-gray-900 text-white">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8 text-cyan-400">
          MAPONAMISECURE
        </h1>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
          <h2 className="text-2xl font-semibold mb-4">Étape 1 : Mon Identité FIMAKIKUTSHI Anonyme</h2>
          <button
            onClick={handleCreateIdentity}
            className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded transition"
          >
            Générer mon Identité FIMAKIKUTSHI
          </button>
          {identityCommitment && (
            <div className="mt-4 text-xs break-all bg-gray-900 p-3 rounded">
              <p><strong className="text-cyan-400">Engagement (Public) :</strong> {identityCommitment}</p>
            </div>
          )}
        </div>

        <div className="bg-gray-800 p-6 rounded-lg shadow-xl mb-6">
          <h2 className="text-2xl font-semibold mb-4">Étape 2 : Voter pour un Candidat</h2>
          <div className="mb-4">
            <label className="block mb-2">Sélectionnez votre candidat :</label>
            <select
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(Number(e.target.value))}
              className="bg-gray-700 border border-gray-600 rounded p-3 w-full text-white focus:outline-none focus:border-cyan-400"
            >
              {candidates.map((candidate) => (
                <option key={candidate.id} value={candidate.id}>
                  Candidat {candidate.id} - {candidate.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleVote}
            className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded transition w-full md:w-auto"
          >
            Voter Anonymement avec FIMAKIKUTSHI WALLET (Gasless)
          </button>
        </div>

        {status && (
          <div className="bg-gray-800 border-l-4 border-cyan-400 p-4 rounded shadow-xl">
            <p className="font-semibold">Statut :</p>
            <p className="text-sm mt-1">{status}</p>
          </div>
        )}
      </div>
    </main>
  );
}