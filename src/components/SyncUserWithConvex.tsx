"use client";
import { useUser } from "@clerk/nextjs";

const SyncUserWithConvex = () => {
  const user = useUser();

  return <div>SyncUserWithConvex</div>;
};

export default SyncUserWithConvex;
