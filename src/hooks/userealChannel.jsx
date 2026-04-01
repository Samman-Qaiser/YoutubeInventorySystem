// src/hooks/useRealtimeChannels.js
// ─────────────────────────────────────────────────────────────────────────────
// Firestore onSnapshot → real-time listener
// Jaise hi koi document add/update/delete ho Firestore mein,
// yeh hook automatically naya data deta hai — page refresh ki zaroorat nahi.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../config/firebase";

export const useRealtimeChannels = () => {
  const [channels, setChannels] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);
  const unsubRef = useRef(null);

  useEffect(() => {
    setIsLoading(true);

    const q = query(
      collection(db, "channels"),
      orderBy("createdAt", "desc")
    );

    // onSnapshot — Firestore change hote hi yeh fire hoga
    unsubRef.current = onSnapshot(
      q,
      (snap) => {
        const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setChannels(docs);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Realtime channels error:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    // Cleanup on unmount
    return () => {
      if (unsubRef.current) {
        unsubRef.current();
        unsubRef.current = null;
      }
    };
  }, []);

  return { data: channels, isLoading, error };
};