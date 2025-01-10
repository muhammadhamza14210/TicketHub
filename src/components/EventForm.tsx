"use client";
import React, { useRef, useState, useTransition } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "./ui/form";
import { Input } from "./ui/input";
import Image from "next/image";
import { Button } from "./ui/button";
import { ClipLoader } from "react-spinners";

const formScheme = z.object({
  name: z.string().min(1, "Event name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  eventDate: z.date().min(new Date(new Date().setHours(0, 0, 0, 0))),
  price: z.number().min(0, "Price must be 0 or greater"),
  totalTickets: z.number().min(1, "Total tickets is required")
});

type FormData = z.infer<typeof formScheme>;

interface InitialEventData {
  _id: Id<"events">;
  name: string;
  description: string;
  location: string;
  eventDate: number;
  price: number;
  totalTickets: number;
  imageStorageId?: Id<"_storage">;
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
  const [isPending, startTransition] = useTransition();
  const currentImageUrl = getStoreUrl(initialData?.imageStorageId);

  //Image Upload
  const imageInput = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const updateEventImage = useMutation(api.storage.updateEventImage);
  const deleteImage = useMutation(api.storage.deleteImage);
  const [removedCurrentImage, setRemovedCurrentImage] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formScheme),
    defaultValues: {
      name: initialData?.name ?? "",
      description: initialData?.description ?? "",
      location: initialData?.location ?? "",
      eventDate: initialData ? new Date(initialData?.eventDate) : new Date(),
      price: initialData?.price ?? 0,
      totalTickets: initialData?.totalTickets ?? 1
    }
  });

  const onSubmit = async (data: FormData) => {
    if (!user?.id) return;

    startTransition(async () => {
      try {
        let imageStorageId = null;
        if (selectedImage) {
          imageStorageId = await handleImageUploadUrl(selectedImage);
        }
        if (mode === "edit" && initialData?.imageStorageId) {
          await deleteImage({ storageId: initialData.imageStorageId });
        }

        if (mode === "create") {
          const eventId = await createEvent({
            ...data,
            userId: user.id,
            eventDate: data.eventDate.getTime()
          });

          if (imageStorageId) {
            await updateEventImage({
              eventId,
              storageId: imageStorageId as Id<"_storage">
            });
          }

          router.push(`/event/${eventId}`);
        } else {
          if (!initialData) {
            throw new Error("Initial event data not provided");
          }

          //Update event
          await updateEvent({
            eventId: initialData._id,
            ...data,
            eventDate: data.eventDate.getTime()
          });

          //Update event image if necessary
          if (imageStorageId || removedCurrentImage) {
            await updateEventImage({
              eventId: initialData._id,
              storageId: imageStorageId
                ? (imageStorageId as Id<"_storage">)
                : null
            });
          }
          toast({
            title: "Event updated",
            description: "Your event has been updated successfully"
          });
          router.push(`/event/${initialData._id}`);
        }
      } catch (error) {
        console.error("Error updating event:", error);
        toast({
          variant: "destructive",
          title: "Error creating event",
          description:
            "There was an error creating your event. Please try again."
        });
      }
    });
  };

  async function handleImageUploadUrl(file: File): Promise<string | null> {
    try {
      const postUrl = await generateUploadUrl();
      const result = await fetch(postUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type
        },
        body: file
      });
      const { storageId } = await result.json();
      return storageId;
    } catch (error) {
      console.error("Error generating upload URL:", error);
      return null;
    }
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Form fields */}
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input placeholder="Welcome Back Dinner 2025" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Description</FormLabel>
                <FormControl>
                  <Input
                    placeholder="This is a Welcome Back Dinner for Winter 2025"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Location</FormLabel>
                <FormControl>
                  <Input placeholder="Edmonton" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="eventDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Name</FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      field.onChange(
                        e.target.value ? new Date(e.target.value) : null
                      );
                    }}
                    value={
                      field.value
                        ? new Date(field.value).toISOString().split("T")[0]
                        : ""
                    }
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Per Ticket</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 transform -translate-y-1/2">
                      $
                    </span>
                    <Input
                      type="number"
                      className="pl-6"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="totalTickets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price Per Ticket</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Event Image
            </label>
            <div className="mt-1 flex items-center gap-4">
              {imagePreview || (!removedCurrentImage && currentImageUrl) ? (
                <div className="relative w-32 aspect-square bg-gray-100 rounded-lg">
                  <Image
                    src={imagePreview || currentImageUrl!}
                    alt="Preview"
                    fill
                    className="object-contain rounded-lg"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      setImagePreview(null);
                      setRemovedCurrentImage(true);
                      if (imageInput.current) {
                        imageInput.current.value = "";
                      }
                    }}
                    className="absolute -top-2 -right-2 text-white bg-red-500 rounded-full w-6 h-6 flex 
                    items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    x
                  </Button>
                </div>
              ) : (
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  ref={imageInput}
                  className="block w-full text-sm text-gray-500 file:mr-4
                  file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm
                  file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              )}
            </div>
          </div>
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 
          hover:to-blue-900 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 
          shadow-md flex items-center justify-center gap-2"
        >
          {isPending ? (
            <>
              <ClipLoader className="w-4 h-4 animate-spin" />
            </>
          ) : mode === "create" ? (
            "Create Event"
          ) : (
            "Update Event"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default EventForm;
