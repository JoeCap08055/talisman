import { hexToU8a } from "@polkadot/util"
import { useQuery } from "@tanstack/react-query"
import { api } from "@ui/api"
import useChainByGenesisHash from "@ui/hooks/useChainByGenesisHash"
import { useImageLoaded } from "@ui/hooks/useImageLoaded"

import { QrCode } from "./QrCode"
import { QrCodeSource, qrCodeLogoForSource } from "./QrCodeSourceSelector"

type Props = { genesisHash: string; specVersion: string; qrCodeSource: QrCodeSource }

export const MetadataQrCode = ({ genesisHash, specVersion, qrCodeSource }: Props) => {
  const chain = useChainByGenesisHash(genesisHash)
  const latestMetadataQrUrl = chain?.latestMetadataQrUrl

  const { data, isLoading, error } = useQuery({
    queryKey: ["chainMetadataQr", genesisHash, specVersion],
    queryFn: async () => {
      const hexData = await api.generateChainMetadataQr(genesisHash, Number(specVersion))
      return hexToU8a(hexData)
    },
    enabled: qrCodeSource === "talisman",
    refetchInterval: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  const qrCodeLogo = qrCodeLogoForSource(qrCodeSource)
  const [ref, loaded, onLoad] = useImageLoaded()
  if (latestMetadataQrUrl && qrCodeSource !== "talisman")
    return (
      <>
        <img
          className="absolute h-full w-full p-5"
          src={latestMetadataQrUrl}
          ref={ref}
          onLoad={onLoad}
          onLoadedData={onLoad}
        />
        {loaded && qrCodeLogo ? (
          <img
            className="absolute top-1/2 left-1/2 w-40 -translate-x-1/2 -translate-y-1/2 bg-white p-5"
            src={qrCodeLogo}
          />
        ) : null}
      </>
    )

  if (isLoading || error) return null

  return <QrCode data={data} />
}