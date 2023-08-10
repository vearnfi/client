<script lang="ts">
  import { wallet } from "@/stores/wallet";
  import { trader } from "@/stores/trader";
  import { isNumber } from "@/utils/is-number";
  import { Button } from "@/components/button";
  import { Input } from "@/components/input";

  type ErrorFields = "triggerBalance" | "reserveBalance";
  type Errors = Record<ErrorFields, string[]>;

  /** Form status. */
  let disabled = false;
  /** Errors object. */
  let errors: Errors = {
    triggerBalance: [],
    reserveBalance: [],
  };
  /** VTHO balance to initiate a swap. */
  let triggerBalance = "";
  /** VTHO balance to be retained in the account after the swap. */
  let reserveBalance = "";
  /** Hack to set targets once. */
  let runOnce = false;

  /**
   * Reset errors object.
   */
  function clearErrors(): void {
    let key: keyof typeof errors;
    for (key in errors) {
      errors[key] = [];
    }
  }

  /**
   * Reset field errors
   */
  function clearFieldErrors(fieldName: ErrorFields): void {
    errors[fieldName] = [];
  }

  /**
   * Validate input fields.
   */
  function validateFields(
    triggerBalance: string | undefined,
    reserveBalance: string | undefined,
  ): Errors {
    // Initialize errors
    const _errors: Errors = {
      triggerBalance: [],
      reserveBalance: [],
    };

    // Sanitize inputs
    const _triggerBalance = triggerBalance != null && triggerBalance.trim();
    const _reserveBalance = reserveBalance != null && reserveBalance.trim();

    if (!_triggerBalance) {
      _errors.triggerBalance.push("Required field.");
    } else if (!isNumber(_triggerBalance)) {
      _errors.triggerBalance.push("Please enter a valid amount.");
    } else if (_triggerBalance === "0") {
      _errors.triggerBalance.push("Please enter a positive amount.");
    }
    // TODO: catch MAX_UINT256
    // TODO: triggerBalance - reserveBalance should be big enough

    if (!_reserveBalance) {
      _errors.reserveBalance.push("Required field.");
    } else if (!isNumber(_reserveBalance)) {
      _errors.reserveBalance.push("Please enter a valid amount.");
    } else if (_reserveBalance === "0") {
      _errors.reserveBalance.push("Please enter a positive amount.");
    }

    return _errors;
  }

  /**
   * Store selected configuration into the Trader contract.
   */
  async function handleSubmit(): Promise<void> {
    disabled = true;

    // Clear previous errors if any
    clearErrors();

    // Validate fields
    const err = validateFields(triggerBalance, reserveBalance);

    // In case of errors, display on UI and return handler to parent component
    if (err.triggerBalance.length > 0 || err.reserveBalance.length > 0) {
      errors = err;
      disabled = false;
      return;
    }

    await trader.setConfig(triggerBalance, reserveBalance);

    await wallet.refetchBalance();

    disabled = false;
  }

  // Set stored config values on login.
  $: {
    if ($trader.contract != null && !runOnce) {
      triggerBalance = $trader.triggerBalance;
      reserveBalance = $trader.reserveBalance;
      runOnce = true;
    }
  }
</script>

<form on:submit|preventDefault={handleSubmit} class="flex flex-col space-y-4">
  <Input
    type="text"
    id="triggerBalance"
    label="Trigger Balance"
    placeholder={$trader.triggerBalance || "0"}
    currency="VTHO"
    subtext={`Balance: ${$wallet.balance?.vtho || "0"}`}
    hint="Minimum balance to initiate a swap"
    disabled={disabled || !$wallet.connected}
    error={errors.triggerBalance[0]}
    bind:value={triggerBalance}
    on:input={() => {
      clearFieldErrors("triggerBalance");
    }}
  />
  <Input
    type="text"
    id="reserveBalance"
    label="Reserve Balance"
    placeholder={$trader.reserveBalance || "0"}
    currency="VTHO"
    hint="Minimum balance to be retained after the swap"
    disabled={disabled || !$wallet.connected}
    error={errors.reserveBalance[0]}
    bind:value={reserveBalance}
    on:input={() => {
      clearFieldErrors("reserveBalance");
    }}
  />

  <!-- TODO: move to it's out compoent and use a slot to insert -->
  <p class="text-background">
    Minimum Received
    <br />
    Fees
    <br />
    Next Trade
  </p>

  {#if $wallet.connected}
    <Button
      type="submit"
      intent="primary"
      disabled={disabled ||
        ($trader.triggerBalance === triggerBalance &&
          $trader.reserveBalance === reserveBalance &&
          triggerBalance !== "0" &&
          reserveBalance !== "0")}
      loading={disabled}
      fullWidth
    >
      Save Config
    </Button>
  {/if}

  {#if $wallet.error != null && $wallet.error.length > 0}
    <p class="text-danger">ERROR: {$wallet.error}</p>
  {/if}
  {#if $trader.error != null && $trader.error.length > 0}
    <p class="text-danger">ERROR: {$trader.error}</p>
  {/if}
</form>