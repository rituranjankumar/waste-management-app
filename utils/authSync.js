"use client"
import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import { setUser, clearUser } from "@/store/authSlice";

export default function AuthSync() {
  const { data: session, status, update } = useSession();
  
  const dispatch = useDispatch();
  const lastUserRef = useRef(null);
  
  useEffect(() => {
    //   sync immediately if session exists
   // console.log("SESSION STATUS:", status, "SESSION DATA->", session)
    const currentUser = session?.user || null;

    // Prevent duplicate redux updates
    if (JSON.stringify(lastUserRef.current) === JSON.stringify(currentUser)) {
      return;
    }

    lastUserRef.current = currentUser;

    if (currentUser) {
      dispatch(setUser(currentUser)); 
    } else if (status !== "loading") {
      // Only clear user if we're sure there's no session (not loading)
      dispatch(clearUser());
    }
  }, [session, status, dispatch]);

  return null;
}
