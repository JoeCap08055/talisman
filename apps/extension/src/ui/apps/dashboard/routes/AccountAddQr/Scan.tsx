import { POLKADOT_VAULT_DOCS_URL } from "@core/constants"
import HeaderBlock from "@talisman/components/HeaderBlock"
import { ExternalLinkIcon } from "@talisman/theme/icons"
import { ScanQr } from "@ui/domains/Sign/Qr/ScanQr"

import { useAccountAddQr } from "./context"

export const Scan = () => {
  const { state, dispatch } = useAccountAddQr()
  if (state.type !== "SCAN") return null
  return (
    <>
      <HeaderBlock className="mb-12" title="Import Polkadot Vault" />
      <div className="grid grid-cols-2 gap-12">
        <div>
          <ol className="flex flex-col gap-12">
            {[
              {
                title: "Open Polkadot Vault on your device",
                body: (
                  <>
                    <div>Select the ‘Key Sets’ tab from the bottom navigation bar</div>
                    <div className="mt-4">
                      <a
                        className="text-body-secondary hover:text-body"
                        href={POLKADOT_VAULT_DOCS_URL}
                        target="_blank"
                      >
                        <span className="underline underline-offset-2">
                          Instructions for setting up Polkadot Vault on a new device
                        </span>{" "}
                        <ExternalLinkIcon className="inline" />
                      </a>
                    </div>
                  </>
                ),
              },
              state.cameraError
                ? // CAMERA HAS ERROR
                  {
                    title: "Approve camera permissions",
                    body: "It looks like you’ve blocked permissions for Talisman to access your camera",
                    extra: (
                      <button
                        className="bg-primary/10 text-primary hover:bg-primary/20 mt-6 inline-block rounded-full px-6 text-sm font-light leading-[32px]"
                        onClick={() => dispatch({ method: "enableScan" })}
                      >
                        Retry
                      </button>
                    ),
                    errorIcon: true,
                  }
                : state.enable
                ? // ENABLED AND NO ERROR
                  {
                    title: "Approve camera permissions",
                    body: "Allow Talisman to access your camera to scan QR codes",
                  }
                : // NOT ENABLED
                  {
                    title: "Approve camera permissions",
                    body: "Allow Talisman to access your camera to scan QR codes",
                    extra: (
                      <button
                        className="bg-primary/10 text-primary hover:bg-primary/20 mt-6 inline-block rounded-full px-6 text-sm font-light leading-[32px]"
                        onClick={() => dispatch({ method: "enableScan" })}
                      >
                        Turn on Camera
                      </button>
                    ),
                  },

              {
                title: "Scan QR code",
                body: "Bring the account QR code on the screen of the Polkadot Vault app in front of the camera on your computer. The preview image is blurred for security, but this does not affect the reading",
              },
            ].map(({ title, body, extra, errorIcon }, index) => (
              <li className="relative ml-20" key={index}>
                {errorIcon ? (
                  <div className=" border-alert-error text-alert-error absolute -left-20 flex h-12 w-12 items-center justify-center rounded-full border-2 text-xs font-bold">
                    !
                  </div>
                ) : (
                  <div className="bg-black-tertiary text-body-secondary absolute -left-20 flex h-12 w-12 items-center justify-center rounded-full text-xs lining-nums">
                    {index + 1}
                  </div>
                )}
                <div className="mb-8">{title}</div>
                <p className="text-body-secondary">{body}</p>
                {extra ?? null}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <ScanQr
            type="address"
            enable={state.enable}
            error={!!state.cameraError}
            onScan={(scanned) => dispatch({ method: "onScan", scanned })}
            onError={(error) =>
              [
                "AbortError",
                "NotAllowedError",
                "NotFoundError",
                "NotReadableError",
                "OverconstrainedError",
                "SecurityError",
              ].includes(error.name)
                ? dispatch({
                    method: "setCameraError",
                    error: error.name ?? error.message ?? "error",
                  })
                : dispatch({
                    method: "setScanError",
                    error: error.message.startsWith("Invalid prefix received")
                      ? "QR code is not valid"
                      : error.message ?? "Unknown error",
                  })
            }
          />
          {state.scanError && (
            <div className="text-alert-error bg-alert-error/10 mt-6 inline-block w-[260px] rounded p-4 text-center text-xs font-light">
              {state.scanError}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
