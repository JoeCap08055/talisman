import { HeaderBlock } from "@talisman/components/HeaderBlock"
import { Spacer } from "@talisman/components/Spacer"
import { useTranslation } from "react-i18next"

import { DashboardLayout } from "../../layout/DashboardLayout"
import { JsonAccountImportProvider } from "./context"
import { ImportJsonAccountsForm } from "./ImportJsonAccountsForm"
import { ImportJsonFileDrop } from "./ImportJsonFileDrop"
import { UnlockJsonFileForm } from "./UnlockJsonFileForm"

export const AccountAddJsonPage = () => {
  const { t } = useTranslation("admin")

  return (
    <JsonAccountImportProvider>
      <DashboardLayout withBack centered>
        <HeaderBlock
          title={t("Import JSON")}
          text={t("Please choose the .json file you exported from Polkadot.js or Talisman")}
        />
        <Spacer />
        <ImportJsonFileDrop />
        <Spacer />
        <UnlockJsonFileForm />
        <ImportJsonAccountsForm />
      </DashboardLayout>
    </JsonAccountImportProvider>
  )
}