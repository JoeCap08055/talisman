import { AccountsCatalogTree, TreeItem } from "@core/domains/accounts/helpers.catalog"
import { AccountType } from "@core/domains/accounts/types"
import { FloatingPortal, autoUpdate, useFloating } from "@floating-ui/react"
import { Listbox } from "@headlessui/react"
import { isEthereumAddress } from "@polkadot/util-crypto"
import { Balance, Balances } from "@talismn/balances"
import { ChevronDownIcon, EyeIcon, TalismanHandIcon } from "@talismn/icons"
import { classNames } from "@talismn/util"
import { AccountFolderIcon } from "@ui/domains/Account/AccountFolderIcon"
import { AccountIcon } from "@ui/domains/Account/AccountIcon"
import { AccountTypeIcon } from "@ui/domains/Account/AccountTypeIcon"
import { AllAccountsIcon } from "@ui/domains/Account/AllAccountsIcon"
import Fiat from "@ui/domains/Asset/Fiat"
import { useSelectedAccount } from "@ui/domains/Portfolio/SelectedAccountContext"
import useAccountsCatalog from "@ui/hooks/useAccountsCatalog"
import { useAnalytics } from "@ui/hooks/useAnalytics"
import useBalances from "@ui/hooks/useBalances"
import { useSelectedCurrency } from "@ui/hooks/useCurrency"
import { useSetting } from "@ui/hooks/useSettings"
import { forwardRef, useCallback, useMemo } from "react"
import { useTranslation } from "react-i18next"

type AccountSelectItem =
  | {
      type: "account"
      key: string
      folderId?: string
      name: string
      address: string
      total?: number
      genesisHash?: string | null
      origin?: AccountType
      isPortfolio?: boolean
    }
  | {
      type: "folder"
      key: string
      treeName: AccountsCatalogTree
      id: string
      name: string
      total?: number
      addresses: string[]
    }
type AccountSelectFolderItem = AccountSelectItem & { type: "folder" }

export const AccountSelect = () => {
  const { refs, floatingStyles } = useFloating({
    placement: "bottom-start",
    whileElementsMounted: autoUpdate,
  })

  const { t } = useTranslation()
  const { account: selectedAccount, accounts, select } = useSelectedAccount()
  const balances = useBalances()
  const catalog = useAccountsCatalog()
  const currency = useSelectedCurrency()

  const portfolioBalances = useBalances("portfolio")
  const totalFiat = useMemo(
    () => portfolioBalances.sum.fiat(currency).total,
    [currency, portfolioBalances.sum]
  )

  const balancesByAddress = useMemo(() => {
    // we use this to avoid looping over the balances list n times, where n is the number of accounts in the wallet
    // instead, we'll only interate over the balances one time
    const balancesByAddress: Map<string, Balance[]> = new Map()
    balances.each.forEach((balance) => {
      if (!balancesByAddress.has(balance.address)) balancesByAddress.set(balance.address, [])
      balancesByAddress.get(balance.address)?.push(balance)
    })
    return balancesByAddress
  }, [balances])

  const [portfolioItems, watchedItems] = useMemo((): [AccountSelectItem[], AccountSelectItem[]] => {
    const treeItemToOptions =
      (treeName: AccountsCatalogTree, folderId?: string) =>
      (item: TreeItem): AccountSelectItem | AccountSelectItem[] => {
        const key = item.type === "account" ? `account-${item.address}` : item.id
        const account =
          item.type === "account"
            ? accounts.find((account) => account.address === item.address)
            : undefined

        return item.type === "account"
          ? {
              type: "account",
              key,
              folderId,
              name: account?.name ?? t("Unknown Account"),
              address: item.address,
              total: new Balances(balancesByAddress.get(item.address) ?? []).sum.fiat(currency)
                .total,
              genesisHash: account?.genesisHash,
              origin: account?.origin,
              isPortfolio: !!account?.isPortfolio,
            }
          : [
              {
                type: "folder",
                key,
                treeName,
                id: item.id,
                name: item.name,
                total: new Balances(
                  item.tree.flatMap((account) => balancesByAddress.get(account.address) ?? [])
                ).sum.fiat(currency).total,
                addresses: item.tree.map((account) => account.address),
              },
              ...item.tree.flatMap(treeItemToOptions(treeName, key)),
            ]
      }

    return [
      catalog.portfolio.flatMap(treeItemToOptions("portfolio")),
      catalog.watched.flatMap(treeItemToOptions("watched")),
    ]
  }, [catalog.portfolio, catalog.watched, accounts, t, balancesByAddress, currency])

  const selectedItem = useMemo(
    () =>
      selectedAccount &&
      [...portfolioItems, ...watchedItems].find(
        (item) => item.type === "account" && item.address === selectedAccount.address
      ),
    [selectedAccount, portfolioItems, watchedItems]
  )

  const onChange = useCallback(
    (item: AccountSelectItem | "all-accounts") =>
      item === "all-accounts" ? select(undefined) : item.type === "account" && select(item.address),
    [select]
  )

  const [collapsedFolders = [], setCollapsedFolders] = useSetting("collapsedFolders")
  const onFolderClick = useCallback(
    (item: AccountSelectFolderItem) =>
      setCollapsedFolders((collapsedFolders = []) =>
        collapsedFolders.includes(item.key)
          ? collapsedFolders.filter((key) => key !== item.key)
          : [...collapsedFolders, item.key]
      ),
    [setCollapsedFolders]
  )

  const { genericEvent } = useAnalytics()
  const trackClick = useCallback(
    (address?: string) => {
      genericEvent("select account(s)", {
        type: address ? (isEthereumAddress(address) ? "ethereum" : "substrate") : "all",
        from: "sidebar",
      })
    },
    [genericEvent]
  )

  return (
    <Listbox value={selectedItem} onChange={onChange}>
      {({ open }) => (
        <>
          {accounts.length === 0 && <NoAccountsItem />}
          {accounts.length > 0 && (
            <Listbox.Button ref={refs.setReference} className="w-full text-left">
              <Item
                ref={refs.setReference}
                key={selectedItem?.key}
                item={selectedItem}
                totalFiat={totalFiat}
                open={open}
                button
              />
            </Listbox.Button>
          )}

          <FloatingPortal>
            <div
              ref={refs.setFloating}
              className={classNames(
                "bg-black-primary scrollable scrollable-700 z-10 max-h-[calc(100vh-12rem)] w-[27.2rem] overflow-y-auto overflow-x-hidden",
                "rounded-sm lg:rounded-t-none",
                open && "border-grey-800 border border-t-0"
              )}
              style={floatingStyles}
            >
              <Listbox.Options>
                {watchedItems.length > 0 && (
                  <div className="text-body-secondary flex items-center gap-4 p-4 font-bold">
                    <TalismanHandIcon className="inline" />
                    <div>{t("My portfolio")}</div>
                  </div>
                )}
                <Listbox.Option
                  className="w-full"
                  value="all-accounts"
                  onClick={() => trackClick()}
                >
                  <Item current={selectedItem === undefined} totalFiat={totalFiat} />
                </Listbox.Option>
                {portfolioItems.map((item) =>
                  item.type === "account" &&
                  item.folderId &&
                  collapsedFolders.includes(item.folderId) ? null : (
                    <Listbox.Option
                      className="w-full"
                      key={item.key}
                      value={item}
                      onClick={(event) => {
                        if (item.type === "account") trackClick(item.address)
                        if (item.type !== "folder") return
                        event.preventDefault()
                        event.stopPropagation()
                        onFolderClick(item)
                      }}
                    >
                      <Item
                        item={item}
                        collapsed={collapsedFolders.includes(item.key)}
                        current={item.key === selectedItem?.key}
                      />
                    </Listbox.Option>
                  )
                )}
                {watchedItems.length > 0 && (
                  <div className="text-body-secondary flex items-center gap-4 p-4 font-bold">
                    <EyeIcon className="inline" />
                    <div>{t("Followed only")}</div>
                  </div>
                )}
                {watchedItems.map((item) =>
                  item.type === "account" &&
                  item.folderId &&
                  collapsedFolders.includes(item.folderId) ? null : (
                    <Listbox.Option
                      className="w-full"
                      key={item.key}
                      value={item}
                      onClick={(event) => {
                        if (item.type !== "folder") return
                        event.preventDefault()
                        event.stopPropagation()
                        onFolderClick(item)
                      }}
                    >
                      <Item
                        item={item}
                        collapsed={collapsedFolders.includes(item.key)}
                        current={item.key === selectedItem?.key}
                      />
                    </Listbox.Option>
                  )
                )}
              </Listbox.Options>
            </div>
          </FloatingPortal>
        </>
      )}
    </Listbox>
  )
}

type ItemProps = {
  item?: AccountSelectItem
  collapsed?: boolean
  current?: boolean
  button?: boolean
  open?: boolean
  totalFiat?: number
}
const Item = forwardRef<HTMLDivElement, ItemProps>(function Item(
  { item, collapsed, current, button, open, totalFiat },
  ref
) {
  const { t } = useTranslation()

  const isAllAccounts = !item
  const isAccount = item && item.type === "account"
  const isFolder = item && item.type === "folder"

  if (isFolder) return <FolderItem {...{ ref, item, collapsed }} />

  const icon = isAllAccounts ? (
    <AllAccountsIcon className="shrink-0 text-3xl" />
  ) : isAccount ? (
    <AccountIcon
      className="shrink-0 text-3xl"
      address={item.address}
      genesisHash={item.genesisHash}
    />
  ) : isFolder ? (
    <AccountFolderIcon className="shrink-0 text-3xl" />
  ) : null

  const name = isAllAccounts ? (
    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">
      {t("All Accounts")}
    </div>
  ) : (
    <div className="flex w-full items-center justify-center gap-2 lg:justify-start">
      <div className="overflow-hidden text-ellipsis whitespace-nowrap text-sm">{item.name}</div>
      {isAccount && <AccountTypeIcon className="text-primary" origin={item.origin} />}
    </div>
  )

  return (
    <div
      ref={ref}
      className={classNames(
        "text-body-secondary flex w-full cursor-pointer items-center gap-4 p-5",

        !button && isAccount && item.folderId !== undefined && "bg-grey-900",
        !button && isFolder && "bg-grey-850",

        (current || (button && open)) && "!bg-grey-800 !text-body",
        !isFolder && "hover:bg-grey-800 focus:bg-grey-800 hover:text-body focus:text-body",

        button && "flex-col lg:flex-row",
        button && "rounded-sm",
        button && open && "lg:rounded-b-none",

        current && item === undefined && "hidden"
      )}
    >
      {icon}
      <div
        className={classNames(
          "max-w-full flex-grow flex-col justify-center gap-2 overflow-hidden",
          !button && "flex",
          button && "hidden items-center md:flex lg:items-start"
        )}
      >
        {name}
        <Fiat amount={item?.total !== undefined ? item.total : totalFiat} isBalance noCountUp />
      </div>
      {(button || (isFolder && !collapsed)) && (
        <ChevronDownIcon className={classNames("shrink-0 text-lg", button && "hidden lg:block")} />
      )}
      {isFolder && collapsed && <div>{item.addresses.length}</div>}
    </div>
  )
})

type FolderItemProps = {
  item?: AccountSelectFolderItem
  collapsed?: boolean
}
const FolderItem = forwardRef<HTMLDivElement, FolderItemProps>(function FolderItem(
  { item, collapsed },
  ref
) {
  return (
    <div
      ref={ref}
      className="text-body-disabled bg-grey-850 flex w-full cursor-pointer items-center gap-2 p-2 text-sm"
    >
      <ChevronDownIcon
        className={classNames(
          "shrink-0 transition-transform",
          (collapsed || item?.addresses.length === 0) && "-rotate-90"
        )}
      />
      <div className="flex-grow overflow-hidden text-ellipsis whitespace-nowrap">{item?.name}</div>
      <div className="text-xs">{item?.addresses.length}</div>
    </div>
  )
})

const NoAccountsItem = () => (
  <div className="text-body-secondary flex w-full cursor-pointer flex-col items-center gap-4 rounded-sm p-5 lg:flex-row">
    <div className="bg-body-disabled h-20 w-20 rounded-[2rem]">&nbsp;</div>
    <div className="hidden max-w-full flex-grow flex-col items-center justify-center gap-2 overflow-hidden md:flex lg:items-start">
      No Accounts
      <Fiat amount={0.0} />
    </div>
  </div>
)
