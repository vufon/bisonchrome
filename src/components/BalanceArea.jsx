import { useEffect, useState } from "react";

export default function BalanceArea() {
  const [ticketCount, setTicketCount] = useState()

  useEffect(() => {
    chrome.storage.local.get(['tickets'], function (result) {
      if (result.tickets) {
        setTicketCount(result.tickets)
      } else {
        setTicketCount(0)
        chrome.storage.local.set({ tickets: 0 })
      }
    })
  }, [])

  return (
    <div className="card card-padding-increase mt-4">
      <div className="d-flex justify-content-center align-items-center">
        <div class="dropdown bg-transparent">
          <button class="btn btn-secondary dropdown-toggle bg-transparent account-dropdown" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">
            Account01
          </button>
          <ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">
            <li><a class="dropdown-item" href="#">Account01</a></li>
            <li><a class="dropdown-item" href="#">Account02</a></li>
          </ul>
        </div>
        <img src="/images/copy-icon.svg" alt="Open in tab" width="25" height="25" class="cursor-pointer ms-2" />
      </div>
      <h3 className="flex-center cardTitle mt-3">0,0000 DCR</h3>
      <p className="flex-center my-1">$0,00 USD</p>
      <p className="flex-center exchange-text my-1">1 DCR = $14.10 USD</p>
    </div>
  )
}