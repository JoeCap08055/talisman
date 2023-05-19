import { renderHook } from "@testing-library/react"

import { ADDRESSES } from "../../../../tests/constants"
import { useAccounts } from "../useAccounts"

test("Can get accounts", async () => {
  const { result } = renderHook(() => useAccounts())
  expect(result.current.length).toBe(3)
  expect(result.current[0].address).toBe(ADDRESSES.GAV)
})