/// <reference types="cypress" />

import { chain } from "@/config/index";
import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const REGISTER_TX_ID =
  "0x5eec87fb2abcf21e14a93618dd9c613aa510ee84a2e3514caa3caab67e340223";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

describe("Register", () => {
  beforeEach(() => {
    // Simulate a logged in NOT registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    // TODO: stats should be visible
    api.mockGetUserStats({ statusCode: 404 }).as("getUserStats");
    api.mockGetUserSwaps({ statusCode: 404 }).as("getUserSwaps");
    api
      .mockGetTradesForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.ZERO).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.ZERO).as("fetchReserveBalance");
    connex.mockFetchBalance(BALANCE.POSITIVE).as("fetchBalance");
  });

  it("sends a sign tx request after submitting the form", () => {
    // Arrange
    wallet.spyOnSignTxRequest().as("registerTxRequest");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("reserve-balance-input").clear().type("5").type("{enter}");

    // Assert
    cy.wait("@registerTxRequest").then((interception) => {
      const { type, payload } = interception.request.body;

      expect(type).to.eq("tx");
      expect(payload.message[0]).to.deep.equal({
        to: chain.trader.toLowerCase(),
        value: "0",
        data: "0x4b0bbaa40000000000000000000000000000000000000000000000004563918244f40000",
      });
      expect(payload.message[1]).to.deep.equal({
        to: chain.vtho.toLowerCase(),
        value: "0",
        data: "0x095ea7b30000000000000000000000003147e73faddf17c186bde71e8b4c19a462aa85c7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
      });
      expect(payload.options).to.deep.equal({
        signer: account.toLowerCase(),
        comment:
          "Store Reserve Balance into the Vearn contract.  Additionally, allow the Vearn contract to spend your VTHO in exchange for VET.",
      });
    });
  });

  it("shows me a success message after the tx has been mined", () => {
    // Arrange
    connex
      .mockFetchVTHOAllowance([VTHO_AMOUNT.ZERO, VTHO_AMOUNT.MAX])
      .as("fetchAllowance");
    connex
      .mockFetchTraderReserve([VTHO_AMOUNT.ZERO, VTHO_AMOUNT.FIVE])
      .as("fetchReserveBalance");
    // ^ Replace the existing mocks to simulate a registration flow.
    wallet.spyOnSignTxRequest().as("registerTxRequest");
    wallet.mockSignTxResponse(REGISTER_TX_ID).as("registerTxResponse");
    connex
      .mockRegisterTxReceipt(REGISTER_TX_ID, "mined")
      .as("registerTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("reserve-balance-input").clear().type("5").type("{enter}");
    cy.wait(
      [
        "@registerTxRequest",
        "@registerTxResponse",
        "@registerTxReceipt",
        "@fetchAllowance",
        "@fetchReserveBalance",
      ],
      { timeout: 20_000 },
    );

    // Assert
    cy.getByCy("protocol-is-enabled-message").should("be.visible");
    cy.getByCy("protocol-is-enabled-message").within(($alert) => {
      cy.wrap($alert).contains("5 VTHO");
    });
  });

  it("shows and error message if the tx is rejected", () => {
    wallet.spyOnSignTxRequest().as("registerTxRequest");
    wallet.mockSignTxResponse(REGISTER_TX_ID).as("registerTxResponse");
    connex
      .mockRegisterTxReceipt(REGISTER_TX_ID, "reverted")
      .as("registerTxReceipt");
    cy.visit("/");
    cy.wait(["@fetchAllowance", "@fetchReserveBalance"]);

    // Act
    cy.getByCy("reserve-balance-input").clear().type("5").type("{enter}");

    // Assert
    cy.wait(
      [
        "@registerTxRequest",
        "@registerTxResponse",
        "@registerTxReceipt",
        // "@fetchAllowance",
        // "@fetchReserveBalance",
      ],
      { timeout: 20_000 },
    );
    cy.getByCy("network-error").contains("The transaction has been reverted.");
  });
});
