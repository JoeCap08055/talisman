import AccountName from "@ui/domains/Account/AccountName"
import Avatar from "@ui/domains/Account/Avatar"
import { useIsKnownAddress } from "@ui/hooks/useIsKnownAddress"

import { Address } from "./Address"
import NamedAddress from "./NamedAddress"

export const FormattedAddress = ({ address }: { address: string }) => {
  const isKnown = useIsKnownAddress(address)

  if (isKnown && isKnown.type === "account")
    return <AccountName withAvatar address={isKnown.value.address} />
  if (isKnown && isKnown.type === "contact")
    return <NamedAddress withAvatar address={isKnown.value.address} name={isKnown.value.name} />

  return (
    <span className="gap custom-address flex">
      <Avatar address={address} />
      <Address className="address" address={address} />
    </span>
  )
}