"use client";
import React, { useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Id } from "../../convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { getStoreUrl } from "@/lib/utils";

const formScheme = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  eventDate: z.date().min(new Date(new Date().setHours(0, 0, 0, 0))),
  price: z.number().min(0, "Price must be 0 or greater"),
  totalTickets: z.number().min(1, "Total tickets is required")
});

type formData = z.infer<typeof formScheme>;

interface InitialEventData {
  _id: Id<"events">;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  imageStorageUrl?: Id<"_storage">;
}

interface EventFormProps {
  mode: "create" | "edit";
  initialData?: InitialEventData;
}
const EventForm = ({ mode, initialData }: EventFormProps) => {
  const { user } = useUser();
  const createEvent = useMutation(api.events.createEvent);
  const updateEvent = useMutation(api.events.updateEvent);
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition ] = useTransition()
  const currentImageUrl = getStoreUrl(initialData?.imageStorageUrl);
  return <div>EventForm</div>;
};

export default EventForm;
