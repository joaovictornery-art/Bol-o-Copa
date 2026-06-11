import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db, waitForAuthUser } from "./firebase";

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

export async function submitBet(poolId, bet) {
  const user = await waitForAuthUser();

  await addDoc(collection(db, "pools", poolId, "bets"), {
    ...bet,
    ownerUid: user.uid,
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
