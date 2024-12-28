"use client";
import React from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getStoreUrl } from "@/lib/utils";

type Props = {
  eventId: Id<"events">;
};
const EventCard = ({ eventId }: Props) => {
  const { user } = useUser();
  const router = useRouter();
  const event = useQuery(api.events.getEventById, { eventId });
  const availability = useQuery(api.events.getEventAvaliablility, { eventId });
  const userTicket = useQuery(api.tickets.userTicket, {
    eventId,
    userId: user?.id ?? ""
  });
  const queuePosition = useQuery(api.waitingList.getQueuePosition, {
    eventId,
    userId: user?.id ?? ""
  });
  const imageUrl = getStoreUrl(event?.imageStorageId);
  return <div>EventCard</div>;
};

export default EventCard;
