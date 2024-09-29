import initWasmModule, { hello_background } from './wasm_mod.js';

(async () => {
  await initWasmModule();
})();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.id === 'wasm' && message.payload === 'print') {
    //this function be called on wasm
    hello_background()
    sendResponse({
      response: "response data"
    });
  } else {
    console.log("400 - Incorrect message.id")
  }
})

