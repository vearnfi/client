import { writable, get } from "svelte/store";
import { Connex } from "@vechain/connex";
import { Certificate } from "thor-devkit";
import type BigNumber from "bignumber.js";
import { chain } from "@/config";
import type { WalletId, Balance } from "@/typings/types";
import { ConnexUtils } from "@/blockchain/connex-utils";

type State =
  | {
      connexUtils: ConnexUtils;
      loading: boolean;
      error: string | undefined;
      connected: true;
      account: Address;
      balance: Balance;
      walletId: WalletId;
      baseGasPrice: BigNumber;
    }
  | {
      connexUtils: ConnexUtils | undefined;
      loading: boolean;
      error: string | undefined;
      connected: false;
      account: undefined;
      balance: undefined;
      walletId: WalletId | undefined;
      baseGasPrice: undefined;
    };

const initialState: State = {
  connexUtils: undefined,
  loading: false,
  error: undefined,
  connected: false,
  account: undefined,
  balance: undefined,
  walletId: undefined,
  baseGasPrice: undefined,
};

// Observation: not sure if this is the best abstraction for handling
// wallet related logic.

function createStore() {
  const store = writable<State>({ ...initialState });

  return {
    subscribe: store.subscribe,
    disconnect: function (): void {
      store.set({ ...initialState });
    },
    connect: async function (
      walletId: WalletId,
      account?: Address,
    ): Promise<Address | undefined> {
      this.disconnect();

      store.update((s) => ({
        ...s,
        loading: true,
        walletId,
      }));

      try {
        // VeWorld injects window.vechain which can serve as detection utility.
        if (walletId === "veworld" && !window.vechain) {
          throw new Error("VeWorld is not installed.");
        }

        const connex = new Connex({
          node: chain.rpc[0],
          network: chain.network,
          noExtension: walletId === "sync2",
        });

        const connexUtils = new ConnexUtils(connex);

        // If account is given, it means we are loading user's profile from local storage,
        // i.e., not cert is required.
        if (account != null) {
          store.set({
            connexUtils,
            loading: false,
            error: undefined,
            connected: true,
            account,
            balance: await connexUtils.fetchBalance(account),
            walletId,
            baseGasPrice: await connexUtils.fetchBaseGasPrice(),
          });

          return account;
        }

        const message: Connex.Vendor.CertMessage = {
          purpose: "identification",
          payload: {
            type: "text",
            content: "Sign a certificate to prove your identity.",
          },
        };

        const cert = await connexUtils.signCert(message);

        // This should throw if cert isn't valid.
        Certificate.verify(cert);

        const acc = cert.signer as Address;

        store.set({
          connexUtils,
          loading: false,
          error: undefined,
          connected: true,
          account: acc,
          balance: await connexUtils.fetchBalance(acc),
          walletId,
          baseGasPrice: await connexUtils.fetchBaseGasPrice(),
        });

        return acc;
      } catch (error) {
        store.set({
          ...initialState,
          error: error?.message || "Unknown error occurred.",
        });
      } finally {
        store.update((s) => ({ ...s, loading: false }));
      }
    },
    fetchBalance: async function (): Promise<void> {
      try {
        const data = get(store);

        if (!data.connected) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, account } = data;

        const balance = await connexUtils.fetchBalance(account);

        store.update(() => ({
          ...data,
          balance,
        }));
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
    signTx: async function (
      clauses: Connex.VM.Clause[],
      comment: string,
    ): Promise<Connex.Vendor.TxResponse | undefined> {
      try {
        const data = get(store);

        if (!data.connected) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils, account } = data;

        return connexUtils.signTx(clauses, account, comment);
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
    waitForReceipt: async function (
      txId: string,
    ): Promise<Connex.Thor.Transaction.Receipt | undefined> {
      try {
        const data = get(store);

        if (!data.connected) {
          throw new Error("Wallet is not connected.");
        }

        const { connexUtils } = data;

        return connexUtils.waitForReceipt(txId);
      } catch (error) {
        store.update((s) => ({
          ...s,
          error: error?.message || "Unknown error occurred.",
        }));
      }
    },
  };
}

export const wallet = createStore();
