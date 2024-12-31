"use client";
import React, { useEffect, useState } from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Ticket } from "lucide-react";
import { Button } from "./ui/button";
import ReleaseTicket from "./ReleaseTicket";

type Props = {
  eventId: Id<"events">;
};
const PurchaseTicket = ({ eventId }: Props) => {
  const router = useRouter();
  const { user } = useUser();
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? ""
  });
  const [timeRemaining, setTimeRemaining] = useState("");
  const [isLoading, setisLoading] = useState(false);

  const offerExpires = queuePosition?.offerExpiresAt ?? 0;
  const isExpired = Date.now() > offerExpires;

  useEffect(() => {
    const calculateTimeRemaining = () => {
      if (isExpired) {
        setTimeRemaining("Ticket purchase expired.");
        return;
      }

      const timeRemainingMs = offerExpires - Date.now();
      const timeRemainingSeconds = Math.floor(timeRemainingMs / 1000);
      const minutes = Math.floor(timeRemainingSeconds / 60);
      const seconds = timeRemainingSeconds % 60;

      if (minutes > 0) {
        setTimeRemaining(
          `${minutes} minute${minutes === 1 ? "" : "s"} and ${seconds} second${seconds === 1 ? "" : "s"}`
        );
      } else {
        setTimeRemaining(`${seconds} second${seconds === 1 ? "" : "s"}`);
      }
    };
    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);
    return () => clearInterval(timer);
  }, [offerExpires, isExpired]);

  {
    /* Stripe checkout */
  }
  const handlePurchase = async () => {
    if (!user || !queuePosition || queuePosition.status !== "offered")
      return null;
  };
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-amber-200">
      <div className="space-y-4">
        <div className="bg-white rounded-lg p-6 border border-gray-600">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-200 flex items-center justify-center">
                <Ticket className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  Ticket Reserved
                </h3>
                <p className="text-sm text-gray-500">
                  Expires in {timeRemaining}
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 loading-relaxed">
              A ticket has been reserved for you. Please complete your purchase
              before the timer expires.
            </div>
          </div>
        </div>
        <Button
          onClick={handlePurchase}
          disabled={isExpired || isLoading}
          className="w-full bg-gradient-to-r from-amber-500 to bg-amber-600 text-white px-8 py-4 
          rounded-lg font-bold shadow-md hover:from-amber-600 to hover:bg-amber-700 transform 
          hover:scale-[1.02] transition-all duration-200 disabled:from-gray-400 disabled:to-gray-500 
          disabled:cursor-not-allowed disabled:hover:scale-100 text-lg"
        >
          {isLoading ? "Redirecting to Checkout" : "Purchase Your Ticket Now"}
        </Button>
        <div className="mt-4">
          <ReleaseTicket eventId = {eventId} waitingListId={queuePosition?._id}/>
        </div>
      </div>
    </div>
  );
};

export default PurchaseTicket;
