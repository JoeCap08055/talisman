import styled from "styled-components"
import globeIcon from "@talisman/theme/icons/globe.white.svg"
import { useEthereumNetwork } from "@ui/hooks/useEthereumNetwork"
import { classNames } from "@talisman/util/classNames"

const NetworkLogoContainer = styled.picture`
  & {
    width: 1em;
    height: 1em;
    position: relative;
  }
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
`

type NetworkLogoProps = {
  ethChainId?: number
  className?: string
}

export const NetworkLogo = ({ ethChainId, className }: NetworkLogoProps) => {
  const network = useEthereumNetwork(ethChainId)

  if (!network) return null

  return (
    <NetworkLogoContainer className={classNames("network-logo", className)}>
      {network.iconUrls.map((url, i) => (
        <source key={i} srcSet={url} />
      ))}
      <img src={globeIcon} alt="" />
    </NetworkLogoContainer>
  )
}