"use client";
import React from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { ConvexError } from "convex/values";
import { ClipLoader } from "react-spinners";
import { WAITING_LIST_STATUS } from "../../convex/constants";
import { Clock, OctagonXIcon } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  eventId: Id<"events">;
  userId: string;
};
const JoinQueue = ({ eventId, userId }: Props) => {
  const { toast } = useToast();
  const joinWaitingList = useMutation(api.events.joinWaitingList);
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId
  });
  const userTicket = useQuery(api.tickets.userTicket, { eventId, userId });
  const availability = useQuery(api.events.checkAvailability, { eventId });
  const event = useQuery(api.events.getEventById, { eventId });

  const isEventOwner = event?.userId === userId;

  const handleJoinQueue = async () => {
    try {
      const result = await joinWaitingList({ eventId, userId });
      if (result) {
        console.log("Successfully joined the queue");
        toast({
          title: result.message,
          duration: 3000
        });
      }
    } catch (error) {
      if (
        error instanceof ConvexError &&
        error.message.includes("joined the waiting list too many times")
      ) {
        toast({
          variant: "destructive",
          title: "Slow down there",
          description: error.data,
          duration: 3000
        });
      } else {
        console.error("Error joining the waiting list", error);
        toast({
          variant: "destructive",
          title: "Error joining the waiting list",
          description: "Please try again later",
          duration: 3000
        });
      }
    }
  };

  if (queuePosition === undefined || availability === undefined || !event) {
    return <ClipLoader />;
  }

  if (userTicket) return null;

  const pastEvent = event.eventDate < Date.now();

  return (
    <div>
      {(!queuePosition ||
        queuePosition.status === WAITING_LIST_STATUS.EXPIRED ||
        (queuePosition.status === WAITING_LIST_STATUS.OFFERED &&
          queuePosition.offerExpiresAt &&
          queuePosition.offerExpiresAt < Date.now())) && (
            <>
              {isEventOwner ? (
                <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-700 rounded-lg">
                  <OctagonXIcon className="w-5 h-5" />
                  <span>You cannot buy ticket for your own event</span>
                </div>
              ) : pastEvent ? (
                <div className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gray-100 text-gray-500 rounded-lg">
                  <Clock className="w-5 h-5" />
                  <span>Event has ended</span>
                </div>
              ) : availability.purchasedCount >= availability?.totalTickets ? (
                <div className="text-center p-4">
                  <p className="text-lg font-semibold text-red-600"></p>
                </div>
              ) : (
                <Button
                  onClick={handleJoinQueue}
                  disabled={pastEvent || isEventOwner}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700
                  transition-colors duration-200 shadow-md flex items-center justify-center disabled:bg-gray-400
                  disabled:cursor-not-allowed"
                >
                  Buy Ticket
                </Button>
              )}
            </>
          )}
    </div>
  );
};

export default JoinQueue;
