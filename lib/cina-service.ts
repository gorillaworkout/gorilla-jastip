/** Layanan data workspace Jastip Cina (Firestore client SDK).
 *  Akses dijaga oleh firestore.rules: super admin (role admin) atau email
 *  yang terdaftar di koleksi cina-team. */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { jakartaYYMM, type CinaOrder, type CinaTeamMember } from "./cina";

const ORDERS = "cina-orders";
const TEAM = "cina-team";
const COUNTERS = "cina-counters";

function mustDb() {
  if (!db) throw new Error("Firestore belum dikonfigurasi");
  return db;
}

function orderFromDoc(id: string, data: Record<string, unknown>): CinaOrder {
  return {
    id,
    orderId: (data.orderId as string) ?? "",
    customerName: (data.customerName as string) ?? "",
    customerWa: (data.customerWa as string) ?? "",
    productName: (data.productName as string) ?? "",
    productLink: (data.productLink as string) ?? "",
    quantity: (data.quantity as number) ?? 1,
    specs: (data.specs as string) ?? "",
    estimateIdr: (data.estimateIdr as number | null) ?? null,
    status: (data.status as CinaOrder["status"]) ?? "inquiry",
    chinaTracking: (data.chinaTracking as string) ?? "",
    domesticTracking: (data.domesticTracking as string) ?? "",
    notes: (data.notes as string) ?? "",
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdBy: data.createdBy as string | undefined,
    createdByName: data.createdByName as string | undefined,
  };
}

export async function getCinaOrders(): Promise<CinaOrder[]> {
  const database = mustDb();
  const snap = await getDocs(
    query(collection(database, ORDERS), orderBy("createdAt", "desc"), limit(200)),
  );
  return snap.docs.map((d) => orderFromDoc(d.id, d.data()));
}

export async function getCinaOrder(id: string): Promise<CinaOrder | null> {
  const database = mustDb();
  const snap = await getDoc(doc(database, ORDERS, id));
  if (!snap.exists()) return null;
  return orderFromDoc(snap.id, snap.data());
}

export interface NewCinaOrderInput {
  customerName: string;
  customerWa: string;
  productName: string;
  productLink: string;
  quantity: number;
  specs: string;
  estimateIdr: number | null;
  notes: string;
  createdBy?: string;
  createdByName?: string;
}

/** Buat order baru dengan nomor urut CN-YYMM-### (transaksi counter). */
export async function createCinaOrder(input: NewCinaOrderInput): Promise<CinaOrder> {
  const database = mustDb();
  const counterRef = doc(database, COUNTERS, "orders");
  const orderRef = doc(collection(database, ORDERS));
  const created = await runTransaction(database, async (tx) => {
    const counterSnap = await tx.get(counterRef);
    const seq = ((counterSnap.data()?.seq as number | undefined) ?? 0) + 1;
    tx.set(counterRef, { seq, updatedAt: serverTimestamp() }, { merge: true });
    const orderId = `CN-${jakartaYYMM()}-${String(seq).padStart(3, "0")}`;
    const data = {
      ...input,
      orderId,
      status: "inquiry",
      chinaTracking: "",
      domesticTracking: "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    tx.set(orderRef, data);
    return { id: orderRef.id, ...data };
  });
  return created as unknown as CinaOrder;
}

export async function updateCinaOrder(
  id: string,
  patch: Partial<CinaOrder>,
): Promise<void> {
  const database = mustDb();
  const { id: _ignored, ...rest } = patch;
  await updateDoc(doc(database, ORDERS, id), {
    ...rest,
    updatedAt: serverTimestamp(),
  });
}

/** Apakah email terdaftar di tim Cina (doc id = email huruf kecil). */
export async function getCinaAccess(email: string): Promise<boolean> {
  const database = mustDb();
  const clean = email.trim().toLowerCase();
  if (!clean) return false;
  try {
    const snap = await getDoc(doc(database, TEAM, clean));
    return snap.exists();
  } catch {
    // Permission denied = bukan anggota tim (atau rules belum ter-deploy).
    return false;
  }
}

export async function getCinaTeam(): Promise<CinaTeamMember[]> {
  const database = mustDb();
  const snap = await getDocs(collection(database, TEAM));
  return snap.docs
    .map((d) => ({
      email: (d.data().email as string) ?? d.id,
      name: (d.data().name as string) ?? "",
      addedAt: d.data().addedAt,
    }))
    .sort((a, b) => a.email.localeCompare(b.email));
}

export async function addCinaTeamMember(email: string, name: string): Promise<void> {
  const database = mustDb();
  const clean = email.trim().toLowerCase();
  if (!clean) throw new Error("Email tidak boleh kosong");
  await setDoc(doc(database, TEAM, clean), {
    email: clean,
    name: name.trim(),
    addedAt: serverTimestamp(),
  });
}

export async function removeCinaTeamMember(email: string): Promise<void> {
  const database = mustDb();
  await deleteDoc(doc(database, TEAM, email.trim().toLowerCase()));
}
