import {
  ListingCancelled as ListingCancelledEvent,
  ListingCreated as ListingCreatedEvent,
  ListingPurchased as ListingPurchasedEvent,
  ListingUpdated as ListingUpdatedEvent
} from "../generated/NFTMarket/NFTMarket"
import {
  ListingCancelled,
  ListingCreated,
  ListingPurchased,
  ListingUpdated
} from "../generated/schema"

export function handleListingCancelled(event: ListingCancelledEvent): void {
  let entity = new ListingCancelled(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleListingCreated(event: ListingCreatedEvent): void {
  let entity = new ListingCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.price = event.params.price
  entity.seller = event.params.seller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleListingPurchased(event: ListingPurchasedEvent): void {
  let entity = new ListingPurchased(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.seller = event.params.seller
  entity.buyer = event.params.buyer

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleListingUpdated(event: ListingUpdatedEvent): void {
  let entity = new ListingUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.nftAddress = event.params.nftAddress
  entity.tokenId = event.params.tokenId
  entity.newPrice = event.params.newPrice
  entity.seller = event.params.seller

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
