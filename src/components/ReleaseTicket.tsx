import React from 'react'
import { Id } from '../../convex/_generated/dataModel'

type Props = {
    eventId: Id<'events'>
}
const ReleaseTicket = ({ eventId }: Props) => {
  return (
    <div>ReleaseTicket</div>
  )
}

export default ReleaseTicket