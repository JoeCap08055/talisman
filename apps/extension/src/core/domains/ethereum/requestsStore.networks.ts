import type {
  AddEthereumChainParameter,
  AddEthereumChainRequest,
} from "@core/domains/ethereum/types"
import { RequestStore } from "@core/libs/RequestStore"
import { urlToDomain } from "@core/util/urlToDomain"

class AddNetworkError extends Error {}

export default class EthereumNetworksRequestsStore extends RequestStore<
  AddEthereumChainRequest,
  null
> {
  async requestAddNetwork(url: string, network: AddEthereumChainParameter) {
    const { err, val: urlVal } = urlToDomain(url)
    if (err) throw new AddNetworkError(urlVal)

    // Do not enqueue duplicate requests from the same app
    const isDuplicate = this.getAllRequests().some((request) => request.idStr === urlVal)

    if (isDuplicate) {
      throw new AddNetworkError(
        "Pending add network already exists for this site. Please accept or reject the request."
      )
    }
    await this.createRequest({ url, network, idStr: urlVal })
  }
}
