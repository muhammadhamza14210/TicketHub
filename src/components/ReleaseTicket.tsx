import React, { useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "./ui/button";
import { XCircle } from "lucide-react";

type Props = {
  waitingListId?: Id<"waitingList">;
  eventId: Id<"events">;
};
const ReleaseTicket = ({ waitingListId, eventId }: Props) => {
const [isReleasing, setIsReleasing] = useState(false);
const releaseTicket = useMutation(api.waitingList.releaseTicket);
const handleRelease = async () => {
    if (!confirm("Are you sure you want to release your ticket offer?")) return;

    try {
        setIsReleasing(true);
        await releaseTicket({ waitingListId: waitingListId!, eventId });
    } catch (error) {
        console.error("Error releasing ticket offer:", error);
    } finally {
        setIsReleasing(false);
    }
};
  return (
    <Button
      onClick={handleRelease}
      disabled={isReleasing}
      className="mt-2 w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-200 text-red-700
      rounded-lg hover:bg-red-300 transition disabled:opacity-50 disabled:cursor-not-allowed "
    >
      <XCircle className="w-4 h-4" />
      {isReleasing ? "Releasing....." : "Release Ticket Offer"}
    </Button>
  );
};

export default ReleaseTicket;
