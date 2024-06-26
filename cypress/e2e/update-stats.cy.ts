/// <reference types="cypress" />

import { makeWallet } from "cypress/support/mocks/wallet";
import { makeApi } from "cypress/support/mocks/api";
import { makeConnex, VTHO_AMOUNT, BALANCE } from "cypress/support/mocks/connex";

const walletId = "sync2";
const account = "0x970248543238481b2AC9144a99CF7F47e28A90e0";

const api = makeApi(account);
const connex = makeConnex(account);
const wallet = makeWallet(walletId, account);

describe("Update stats", () => {
  beforeEach(() => {
    // Simulate a logged in registered account holding a positive balance.
    wallet.simulateLoggedInAccount();

    api
      .mockGetUserStats([
        { fixture: "user-stats.json" },
        { fixture: "user-stats-updated.json" },
      ])
      .as("getUserStats");
    // ^ Simulate a stats update.
    api.mockGetUserSwaps({ statusCode: 404 }).as("getUserSwaps");
    api
      .mockGetTradesForecast({ fixture: "trades-forecast.json" })
      .as("getTradesForecast");

    // Simulate a registered account with a positive balance
    connex
      .mockFetchBalance([BALANCE.POSITIVE, BALANCE.UPDATED])
      .as("fetchBalance");
    // ^ Simulate a balance update.
    connex.mockFetchVTHOAllowance(VTHO_AMOUNT.MAX).as("fetchAllowance");
    connex.mockFetchTraderReserve(VTHO_AMOUNT.FIVE).as("fetchReserveBalance");

    cy.visit("/");
    cy.wait(
      [
        "@getUserStats",
        "@getUserSwaps",
        "@getTradesForecast",
        "@fetchAllowance",
        "@fetchReserveBalance",
        "@fetchBalance",
      ],
      { timeout: 20_000 },
    );
  });

  it.skip("shows latest stats when balance gets updated", () => {
    // Arrange
    cy.getByCy("stats").should("be.visible");
    cy.getByCy("stats").within(($stats) => {
      cy.wrap($stats).contains("11");
      cy.wrap($stats).contains("14.82");
      cy.wrap($stats).contains("12.26");
    });

    // Act
    cy.wait(["@fetchBalance", "@getUserStats"], { timeout: 20_000 });

    // Assert
    cy.getByCy("stats").should("be.visible");
    cy.getByCy("stats").within(($stats) => {
      cy.wrap($stats).contains("12");
      cy.wrap($stats).contains("15.82");
      cy.wrap($stats).contains("12.26");
    });
  });
});
