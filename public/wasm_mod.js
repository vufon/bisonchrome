let mod, inst;
async function wasmInit() {
    const go = new Go();
    WebAssembly.instantiateStreaming(fetch("api.wasm"), go.importObject).then(async (result) => {
        mod = result.module;
        inst = result.instance;
        await go.run(inst);
    });
}

export function wasmCreateWallet(password) {
    return createWallet(password)
}

export function wasmExportSeed() {
    return exportSeed()
}

export default wasmInit;