"use client";
import React from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

type Props = {
  eventId: Id<"events">;
};
const EventCard = ({ eventId }: Props) => {
  const { user } = useUser();
  const router = useRouter();
  const event = useQuery(api.events.getEventById, { eventId })
  return <div>EventCard</div>;
};

export default EventCard;
