import React from "react";
import { Id } from "../../convex/_generated/dataModel";

type Props = {
  eventId: Id<"events">;
};
const EventCard = ({ eventId }: Props) => {
  return <div>EventCard</div>;
};

export default EventCard;
