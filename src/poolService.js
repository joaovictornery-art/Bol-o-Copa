import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes } from "firebase/storage";
import { db, storage, waitForAuthUser } from "./firebase";

function cleanFileName(fileName) {
  return fileName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]/g, "-")
    .replace(/-+/g, "-")
    .toLowerCase();
}

export function subscribePools(onNext, onError) {
  const poolsQuery = query(collection(db, "pools"), orderBy("createdAt", "desc"));
  return onSnapshot(
    poolsQuery,
    (snapshot) => {
      onNext(snapshot.docs.map((pool) => ({ id: pool.id, ...pool.data() })));
    },
    onError,
  );
}

export function subscribeBets(poolId, onNext, onError) {
  const betsQuery = query(
    collection(db, "pools", poolId, "bets"),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    betsQuery,
    (snapshot) => {
      onNext(snapshot.docs.map((bet) => ({ id: bet.id, ...bet.data() })));
    },
    onError,
  );
}

export async function createPool(pool) {
  await waitForAuthUser();

  const docRef = await addDoc(collection(db, "pools"), {
    ...pool,
    entryFee: Number(pool.entryFee),
    resultPublished: false,
    officialHome: 0,
    officialAway: 0,
    officialScorer: "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function submitBet(poolId, bet, receiptFile) {
  const user = await waitForAuthUser();
  const betRef = doc(collection(db, "pools", poolId, "bets"));
  const receiptPath = `receipts/${poolId}/${user.uid}/${betRef.id}-${Date.now()}-${cleanFileName(
    receiptFile.name,
  )}`;

  await uploadBytes(ref(storage, receiptPath), receiptFile, {
    contentType: receiptFile.type || "application/octet-stream",
    customMetadata: {
      poolId,
      betId: betRef.id,
      ownerUid: user.uid,
    },
  });

  await setDoc(betRef, {
    ...bet,
    ownerUid: user.uid,
    receiptName: receiptFile.name,
    receiptPath,
    confirmed: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function updateBetConfirmed(poolId, betId, confirmed) {
  await updateDoc(doc(db, "pools", poolId, "bets", betId), {
    confirmed,
    updatedAt: serverTimestamp(),
  });
}

export async function updatePoolResult(poolId, result) {
  await updateDoc(doc(db, "pools", poolId), {
    ...result,
    updatedAt: serverTimestamp(),
  });
}
