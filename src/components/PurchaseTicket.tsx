import React from 'react'
import { Id } from '../../convex/_generated/dataModel'

type Props = {
    eventId : Id<'events'>
}
const PurchaseTicket = ({ eventId }: Props) => {
  return (
    <div>PurchaseTicket</div>
  )
}

export default PurchaseTicket