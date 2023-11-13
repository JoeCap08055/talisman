import { useCallback } from "react"
import { useForm } from "react-hook-form"
import { Button } from "talisman-ui"
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useWalletClient,
} from "wagmi"

import { TestBasics, useDeployment } from "../../../contracts"
import { IconLoader } from "../../../icons"
import { Section } from "../../shared/Section"
import { ContractConnect } from "../shared/ContractConnect"
import { TransactionReceipt } from "../shared/TransactionReceipt"

type FormData = { newValue: number }

export const ContractTestBasics = () => {
  const { isConnected } = useAccount()

  if (!isConnected) return null

  return (
    <Section title="Basic contract">
      <ContractTestBasicsInner />
    </Section>
  )
}

const ContractTestBasicsInner = () => {
  const { isConnected } = useAccount()
  const { chain } = useNetwork()
  const { address } = useDeployment("TestBasics", chain?.id)

  const { data: walletClient } = useWalletClient()

  const { data: readData, isLoading: readIsLoading } = useContractRead({
    address,
    abi: TestBasics.abi,
    functionName: "getValue",
    enabled: !!address,
    watch: true,
  })

  const {
    register,
    handleSubmit,
    watch,
    formState: { isValid, isSubmitting },
  } = useForm<FormData>()

  const newValue = watch("newValue")

  const { config, error, isLoading } = usePrepareContractWrite({
    address,
    abi: TestBasics.abi,
    functionName: "setValue",
    enabled: !!address && !!newValue,
    args: [newValue],
  })
  const {
    data: writeData,
    isSuccess: writeIsSuccess,
    error: writeError,
    isError: writeIsError,
    write,
  } = useContractWrite(config)

  const onSubmit = useCallback(() => {
    write?.()
  }, [write])

  // allows testing an impossible contract interaction (transfer more than you have to test)
  const handleSendUnchecked = useCallback(async () => {
    if (!walletClient || !address) return

    await walletClient.writeContract({
      abi: TestBasics.abi,
      address,
      functionName: "setValue",
      args: [newValue],
    })
  }, [address, newValue, walletClient])

  if (!isConnected) return null

  return (
    <div>
      <ContractConnect contract="TestBasics" />
      <div className="mt-8 text-base">
        {address ? (
          <>
            <div>Current value : {readData?.toString()}</div>
            <div>Forbidden values : 69, 420, 666</div>
            <form className="text-body-secondary space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div className="inline-flex items-center">
                <label className="w-48" htmlFor="send-tokens-to">
                  Set value
                </label>
                <input
                  type="text"
                  id="send-tokens-to"
                  autoComplete="off"
                  spellCheck={false}
                  className="h-12"
                  {...register("newValue", { required: true })}
                />
                {isLoading && <IconLoader className="animate-spin-slow ml-2" />}
              </div>
              <div>
                {!isLoading && newValue && error && (
                  <pre className="text-alert-error h-96 p-2">{error.message}</pre>
                )}
              </div>
              <div className="flex gap-4">
                <Button
                  small
                  type="submit"
                  processing={readIsLoading}
                  disabled={!isValid || isSubmitting || !!error || isLoading}
                >
                  Send
                </Button>
                <Button
                  small
                  type="button"
                  onClick={handleSendUnchecked}
                  processing={readIsLoading}
                >
                  Send unchecked
                </Button>
              </div>
            </form>
            <div className="my-8">
              {writeIsSuccess && (
                <>
                  <pre className="text-alert-success my-8">
                    Transaction: {JSON.stringify(writeData, undefined, 2)}
                  </pre>
                  <TransactionReceipt hash={writeData?.hash} />
                </>
              )}
              {writeIsError && (
                <div className="text-alert-error my-8 ">Error : {writeError?.message}</div>
              )}
            </div>
          </>
        ) : (
          <div className="text-body-secondary">Test contract isn't deployed on this network.</div>
        )}
      </div>
    </div>
  )
}
