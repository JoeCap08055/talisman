import { BalanceFormatter } from "@core/domains/balances"
import { getTokenLogoUrl } from "@ui/domains/Asset/TokenLogo"
import { useEthSignTransactionRequest } from "@ui/domains/Sign/SignRequestContext"
import useToken from "@ui/hooks/useToken"
import { ethers } from "ethers"
import { FC, useMemo } from "react"
import { SignParamAccountButton, SignParamNetworkAddressButton } from "./shared"
import { EthSignContainer } from "./shared/EthSignContainer"
import { SignParamTokensDisplay } from "./shared/SignParamTokensDisplay"

export const EthSignBodyDefault: FC = () => {
  const { network, transactionInfo, request } = useEthSignTransactionRequest()

  const nativeToken = useToken(network?.nativeToken?.id)

  const amount = useMemo(() => {
    return nativeToken && transactionInfo?.value?.gt(0)
      ? new BalanceFormatter(
          transactionInfo.value.toString(),
          nativeToken.decimals,
          nativeToken.rates
        )
      : null
  }, [nativeToken, transactionInfo?.value])

  const { from } = useMemo(
    () => request as Required<ethers.providers.TransactionRequest>,
    [request]
  )

  if (!transactionInfo) return null
  if (!network) return null
  if (!nativeToken) return null

  return (
    <EthSignContainer title={amount && request.to ? "Transfer Request" : "Transaction Request"}>
      {amount && request.to ? (
        <>
          <div>You are transferring</div>
          <div>
            <SignParamTokensDisplay
              withIcon
              tokens={amount.tokens}
              fiat={amount.fiat("usd")}
              decimals={nativeToken.decimals}
              symbol={nativeToken.symbol}
              image={getTokenLogoUrl(nativeToken)}
            />
          </div>
          <div className="flex">
            <span>from </span>
            <SignParamAccountButton address={from} withIcon />
          </div>
          <div className="flex">
            <span>to {transactionInfo.isContractCall ? "contract" : "account"} </span>
            {transactionInfo.isContractCall ? (
              <SignParamNetworkAddressButton network={network} address={request.to} />
            ) : (
              <SignParamAccountButton
                explorerUrl={network.explorerUrl}
                address={request.to}
                withIcon
              />
            )}
          </div>
        </>
      ) : (
        <>
          <div>You are submitting a transaction</div>
          <div className="flex">
            <span>with</span>
            <SignParamAccountButton address={from} withIcon />
          </div>
          {request.to ? (
            <div className="flex">
              <span>on contract</span>
              <SignParamNetworkAddressButton network={network} address={request.to} />
            </div>
          ) : null}
        </>
      )}
      {transactionInfo.contractCall?.name && (
        <div>
          method: <span className="text-white">{transactionInfo.contractCall.name}</span>
        </div>
      )}
    </EthSignContainer>
  )
}