/// <reference types="cypress" />

import type { WalletId } from "@/typings/types";
import type { Certificate } from "thor-devkit";

export type CertStatus = "valid" | "invalid";

const CERTIFICATES: Record<Address, Certificate> = {
  "0x2057ca7412e6c0828501cb7b335e166f81c58d26": {
    purpose: "identification",
    payload: {
      type: "text",
      content: "Sign a certificate to prove your identity.",
    },
    domain: "localhost:5173",
    timestamp: 1714963380,
    signer: "0x2057ca7412e6c0828501cb7b335e166f81c58d26",
    signature:
      "0x73a1337fe10332b920370e5e926fae36302edf592c1a69006066b147484f7ab03560af721cc01b40fc7c2b1b21726e7dbc1d95b8ea0f19b7ca2323dfb5b49b7501",
  },
  "0x970248543238481b2AC9144a99CF7F47e28A90e0": {
    purpose: "identification",
    payload: {
      type: "text",
      content: "Sign a certificate to prove your identity.",
    },
    domain: "localhost:5173",
    timestamp: 1714964751,
    signer: "0x970248543238481b2ac9144a99cf7f47e28a90e0",
    signature:
      "0xd58a7278c7f559ce28f866f9842fb82956a5473d0f9703fcf3938e03a26530571fde8bd56f7db78ab6fc91b3cfc62e95dabdf054cc941c1bb31668efda08618d01",
  },
};

/**
 * Factory to intercept and mock API calls aimed to the wallet.
 */
export function makeWallet(walletId: WalletId, account: Address) {
  /**
   * Simulate a logged out account.
   */
  function simulateLoggedOutAccount() {
    cy.clearLocalStorage();
  }

  /**
   * Simulate a logged in account.
   */
  function simulateLoggedInAccount() {
    localStorage.setItem(
      "user",
      JSON.stringify({ walletId, cert: CERTIFICATES[account] }),
    );
  }

  /**
   * Look for the Sync2 Buddy iframe.
   * @return Iframe cypress subject
   */
  function getSync2Iframe(): Cypress.Chainable {
    return cy
      .get("iframe", { timeout: 20_000 })
      .eq(1)
      .its("0.contentDocument.body")
      .then(cy.wrap);
  }

  /**
   * Intercept a sign tx request and add assertions on top of it.
   * @return Spied on request.
   */
  function spyOnSignTxRequest() {
    return cy.intercept("POST", "https://tos.vecha.in/*");
  }

  /**
   * Mock a sign tx request for the given tx id.
   * @param {string} txId Transaction id.
   * @return Mocked request.
   */
  function mockSignTxResponse(txId: string) {
    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            txid: txId,
            signer: account,
          },
        },
      });
    });
  }

  /**
   * Mock a certificate request signature.
   * @param {CertStatus} certStatus. Whether or not the mocked signature should be valid.
   * @return Mocked request.
   */
  function mockSignCertResponse(certStatus: CertStatus) {
    const valid = certStatus === "valid";

    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          payload: {
            annex: {
              domain: "127.0.0.1:5173",
              signer: account,
              timestamp: 1701217618,
            },
            signature: valid
              ? "0x353d78959165e3fe35b97bcd738d116f5567fab6e4d1c339a02f9aa48a27379b3785356e34886ec9596a53d840e848d4e6caa255d05e84544b777ab501a0a20f01"
              : "0x053d78959165e3fe35b97bcd738d116f5567fab6e4d1c339a02f9aa48a27379b3785356e34886ec9596a53d840e848d4e6caa255d05e84544b777ab501a0a20f01",
            // ^ We alter the first character in the signature to make it invalid.
          },
        },
      });
    });
  }

  /**
   * Mock a decline certificate request signature.
   * @return Mocked request.
   */
  function mockDeclineSignCertResponse() {
    return cy.intercept("GET", "https://tos.vecha.in/*", (req) => {
      req.reply({
        statusCode: 200,
        body: {
          error: "user decline",
        },
      });
    });
  }

  return Object.freeze({
    simulateLoggedOutAccount,
    simulateLoggedInAccount,
    getSync2Iframe,
    spyOnSignTxRequest,
    mockSignTxResponse,
    mockSignCertResponse,
    mockDeclineSignCertResponse,
  });
}
