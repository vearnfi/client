import { describe, test, expect } from "vitest";
import { expandTo18Decimals } from "./expand-to-18-decimals";

const tests = [
  {
    name: "one-proper",
    wei: "1000000000000000000",
    kwei: "1000000000000000.0",
    mwei: "1000000000000.0",
    gwei: "1000000000.0",
    szabo: "1000000.0",
    finney: "1000.0",
    ether: "1.0",
    ether_format: "1.0",
    finney_format: "1000.0",
    szabo_format: "1000000.0",
    gwei_format: "1000000000.0",
    mwei_format: "1000000000000.0",
    kwei_format: "1000000000000000.0",
  },
  {
    name: "one-bare",
    wei: "1000000000000000000",
    ether: "1",
    ether_format: "1.0",
  },
  {
    name: "one-trailing-zero",
    wei: "1000000000000000000",
    ether: "1.00",
    ether_format: "1.0",
  },
  {
    name: "one-leading-zero",
    wei: "1000000000000000000",
    ether: "01.0",
    ether_format: "1.0",
  },
  {
    name: "negative-one-proper",
    wei: "-1000000000000000000",
    ether: "-1.0",
    ether_format: "-1.0",
  },
  {
    name: "negative-one-leading",
    wei: "-1000000000000000000",
    ether: "-01.0",
    ether_format: "-1.0",
  },
  {
    name: "tenth-proper",
    wei: "100000000000000000",
    ether: "0.1",
    ether_format: "0.1",
  },
  {
    name: "tenth-bare",
    wei: "100000000000000000",
    ether: ".1",
    ether_format: "0.1",
  },
  {
    name: "tenth-trailing-zero",
    wei: "100000000000000000",
    ether: "0.10",
    ether_format: "0.1",
  },
  {
    name: "tenth-trailing-zeros",
    wei: "100000000000000000",
    ether: "0.100",
    ether_format: "0.1",
  },
  {
    name: "tenth-trailing-and-leading",
    wei: "100000000000000000",
    ether: "00.100",
    ether_format: "0.1",
  },
  {
    name: "negative-tenth-proper",
    wei: "-100000000000000000",
    ether: "-0.1",
    ether_format: "-0.1",
  },
  {
    name: "hundredth-proper",
    wei: "10000000000000000",
    ether: "0.01",
    ether_format: "0.01",
  },
  {
    name: "amount-fraction",
    wei: "1230000000000000000",
    ether: "1.23",
    ether_format: "1.23",
  },
  {
    name: "amount-negative-fraction",
    wei: "-1230000000000000000",
    ether: "-1.23",
    ether_format: "-1.23",
  },
  {
    name: "pad-negative-fraction",
    wei: "-1230000000000000000",
    ether: "-1.230000000000000000",
    ether_format: "-1.23",
  },
  {
    name: "one-two-three",
    wei: "1234567890000000000000000",
    ether: "1234567.89",
    ether_format: "1234567.89",
  },
  {
    name: "one-two-three-2",
    wei: "1234567890000000000000000",
    ether: "1234567.890000000000000000",
    ether_format: "1234567.89",
  },
  {
    name: "one-two-three-3",
    wei: "-1234567890123456789012345",
    gwei: "-1234567890123456.789012345",
    finney: "-1234567890.123456789012345",
    ether: "-1234567.890123456789012345",
    ether_format: "-1234567.890123456789012345",
    finney_format: "-1234567890.123456789012345",
    gwei_format: "-1234567890123456.789012345",
  },
  {
    name: "satoshi",
    wei: "-1234567890",
    satoshi: "-12.34567890",
    satoshi_format: "-12.3456789",
    ether: "-0.000000001234567890",
    ether_format: "-0.00000000123456789",
  },
];

describe("expandTo18Decimals", () => {
  for (const tst of tests) {
    const str = <string | null>(<any>tst)["ether"];

    if (str == null) continue;

    test(`converts ether format string to wei: ${tst.name}`, function () {
      const wei = BigInt(tst.wei);
      expect(expandTo18Decimals(str).toFixed()).to.equal(wei.toString(10));
    });
  }
});
