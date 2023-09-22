import { HeaderBlock } from "@talisman/components/HeaderBlock"
import { Spacer } from "@talisman/components/Spacer"
import { StarIcon } from "@talismn/icons"
import { TokenRateCurrency } from "@talismn/token-rates"
import { selectableCurrenciesState } from "@ui/atoms"
import currencyConfig from "@ui/domains/Asset/currencyConfig"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { useRecoilState } from "recoil"

import { DashboardLayout } from "../../layout/DashboardLayout"

const CurrencySettingsPage = () => {
  const currencies = useMemo(
    () =>
      [
        "btc",
        "eth",
        "dot",
        "usd",
        "aud",
        "cny",
        "eur",
        "gbp",
        "jpy",
        "rub",
      ] as const satisfies readonly TokenRateCurrency[],
    []
  )

  const [selectableCurrencies, setSelectableCurrencies] = useRecoilState(selectableCurrenciesState)

  const { t } = useTranslation()

  return (
    <DashboardLayout centered withBack backTo="/settings">
      <HeaderBlock
        title={t("Currency")}
        text={t(
          "Choose your preferred currency. You can toggle between the currencies you’ve marked as favorite directly from your portfolio."
        )}
      />
      <Spacer />
      <div className="flex flex-col gap-4">
        {currencies.map((currency) => (
          <button
            type="button"
            key={currency}
            className="bg-grey-850 enabled:hover:bg-grey-800 text-body-disabled enabled:hover:text-body-secondary flex h-28 w-full cursor-pointer items-center gap-8 rounded-sm px-8 disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() =>
              setSelectableCurrencies((selected) =>
                selected.includes(currency)
                  ? selected.filter((x) => x !== currency)
                  : [...selected, currency]
              )
            }
          >
            <img alt={currency} src={currencyConfig[currency]?.icon} />
            <div className="flex grow flex-col items-start gap-1">
              <div className="text-body uppercase">{currency}</div>
              <div className="text-body-secondary text-xs">
                {currencyConfig[currency]?.unicodeCharacter ?? ""}{" "}
                {currencyConfig[currency]?.name ?? currency}
              </div>
            </div>
            {selectableCurrencies.includes(currency) ? (
              <StarIcon className="stroke-primary fill-primary" />
            ) : (
              <StarIcon />
            )}
          </button>
        ))}
      </div>
    </DashboardLayout>
  )
}

export default CurrencySettingsPage
