'use client'
import React from 'react'
import { Id } from "../../convex/_generated/dataModel";
import { useToast } from '@/hooks/use-toast';

type Props = {
    eventId: Id<"events">
    userId: string
}
const JoinQueue = ( {eventId, userId }: Props) => {
  const { toast } = useToast();
  return (
    <div>JoinQueue</div>
  )
}

export default JoinQueue