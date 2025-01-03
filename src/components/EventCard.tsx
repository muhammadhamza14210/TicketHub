"use client";
import React from "react";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { getStoreUrl } from "@/lib/utils";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  CircleArrowRight,
  LoaderCircle,
  MapPin,
  PencilIcon,
  StarIcon,
  Ticket,
  XCircle
} from "lucide-react";
import { Button } from "./ui/button";
import PurchaseTicket from "./PurchaseTicket";

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

  if (!event || !availability) return null;

  const isPastEvent = event.eventDate < Date.now();
  const isEventOwner = user?.id === event?.userId;

  const renderQueuePosition = () => {
    if (!queuePosition || queuePosition.status !== "waiting") return null;
    if (availability.purchasedCount >= availability.totalTickets) {
      return (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Ticket className="w-5 h-5 text-gray-400 mr-2" />
            <span className="text-red-600">Event is sold out</span>
          </div>
        </div>
      );
    }
    if (queuePosition.position === 2) {
      return (
        <div
          className="flex flex-col lg:flex-row items-center justify-between p-3 bg-gray-50 rounded-lg 
        border border-amber-100"
        >
          <div className="flex items-center">
            <CircleArrowRight className="w-5 h-5 text-amber-600 mr-2" />
            <span className="text-amber-700 font-medium">
              You're next in line! (Queue Position) {queuePosition.position}
            </span>
          </div>
          <div className="flex items-center">
            <LoaderCircle className="w-5 h-5 mr-1 animate-spin text-amber-500" />
            <span className="text-amber-700 font-medium">
              Waiting for ticket
            </span>
          </div>
        </div>
      );
    }

    return (
      <div
        className="flex flex-col lg:flex-row items-center justify-between p-3 bg-blue-50 rounded-lg 
        border border-blue-200"
      >
        <div className="flex items-center">
          <LoaderCircle className="w-5 h-5 mr-1 animate-spin text-blue-500" />
          <span className="text-amber-700 font-medium">Queue Position</span>
        </div>
        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
          #{queuePosition.position}
        </span>
      </div>
    );
  };
  const renderTicketStatus = () => {
    if (!user) return null;

    if (isEventOwner) {
      return (
        <div className="mt-4">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/seller/events/${eventId}/edit`);
            }}
            className="w-full bg-gray-100 text-gray-600 px-6 py-3 rounded-lg
            font-medium hover:bg-gray-200 transition-colors duration-200 shadow-sm
            flex items-center justify-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Edit Event
          </Button>
        </div>
      );
    }

    if (userTicket) {
      return (
        <div className="mt-4 flex items-center justify-between p-3 bg-green-50 rounded-lg border border-gray-100 ">
          <div className="flex items-center">
            <Check className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">
              You have a ticket!
            </span>
          </div>
          <Button
            onClick={() => router.push(`/tickets/${userTicket._id}`)}
            className="text-sm bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-full font-medium shadow-sm
            transition-colors duration-200 flex items-center gap-2"
          >
            View Ticket
          </Button>
        </div>
      );
    }

    if (queuePosition) {
      return (
        <div className="mt-4">
          {queuePosition.status === "offered" && (
            <PurchaseTicket eventId={eventId} />
          )}
          {renderQueuePosition()}
          {queuePosition.status === "expired" && (
            <div className="p-3 bg-red-50 rounded-lg border flex items-center border-red-100">
              <span className="text-red-700 font-medium">
                <XCircle className="w-5 h-5 mr-2" />
                Offer expired
              </span>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div
      onClick={() => router.push(`/event/${eventId}`)}
      className={`bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-300 
      cursor:pointer overflow-hidden relative ${isPastEvent ? "opacity-50 hover:opacity-100" : ""}`}
    >
      {/* Image URL */}
      {imageUrl && (
        <div className="relative w-full">
          <Image
            src={imageUrl}
            alt={event.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
        </div>
      )}

      {/* Event Info */}
      <div className={`p-6 ${imageUrl ? "relative" : ""}`}>
        <div className="flex flex-col justify-between items-start">
          <div>
            <div className="flex flex-col items-start gap-2">
              {isEventOwner && (
                <span
                  className="inline-flex items-center gap-1 bg-blue-600/90 text-white px-2 
                py-1 rounded-full text-xs font-medium"
                >
                  <StarIcon className="w-3 h-3" />
                  Your Events
                </span>
              )}
              <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
            </div>
            {isPastEvent && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100">
                Past Event
              </span>
            )}
          </div>
        </div>
        {/* Price tag */}
        <div className="flex flex-col items-end gap-2 ml-4">
          <span
            className={`px-4 py-1.5 font-semibold rounded-full 
          ${isPastEvent ? "bg-red-50 text-red-500" : "bg-green-50 text-green-500"}`}
          >
            ${event.price.toFixed(2)}
          </span>
          {availability.purchasedCount >= availability.totalTickets && (
            <span className="px-4 py-1.5 bg-red-50 text-red-700 font-semibold rounded-full text-sm">
              Sold Out
            </span>
          )}
        </div>
        {/* Event Details */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <CalendarDays className="w-4 h-4 mr-2" />
            <span>
              {new Date(event.eventDate).toLocaleDateString()}
              {isPastEvent && " (Ended)"}
            </span>
          </div>
          <div className="flex items-center text-gray-600">
            <Ticket className="w-4 h-4 mr-2" />
            <span>
              {availability.totalTickets - availability.purchasedCount} /{" "}
              {availability.totalTickets} Available
              {!isPastEvent && availability.activeOffers > 0 && (
                <span className="text-amber-600 text-sm ml-2">
                  {availability.activeOffers}
                  {availability.activeOffers === 1 ? " person" : " people"} trying
                  to buy
                </span>
              )}
            </span>
          </div>
        </div>
        {/* Event Description */}
        <p className="mt-4 text-gray-700 line-clamp-2">{event.description}</p>
        {/* Ticket status */}
        <div onClick={(e) => e.stopPropagation()}>
          {!isPastEvent && renderTicketStatus()}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
