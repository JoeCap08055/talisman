import { SettingsStoreData, settingsStore } from "@core/domains/app/store.settings"
import { GetRecoilValue, atom, selectorFamily } from "recoil"

const settingsState = atom<SettingsStoreData>({
  key: "settingsState",
  effects: [
    ({ setSelf }) => {
      const sub = settingsStore.observable.subscribe(setSelf)
      return () => sub.unsubscribe()
    },
  ],
})

export const settingQuery = selectorFamily({
  key: "settingQuery",
  get:
    <K extends keyof SettingsStoreData>(key: K) =>
    <V extends SettingsStoreData[K]>({ get }: { get: GetRecoilValue }): V => {
      const settings = get(settingsState)
      return settings[key] as V
    },
  set: (key) => (_, value) => {
    // update the rxjs observable so the derived recoil atom is updated
    settingsStore.set({ [key]: value })
  },
})