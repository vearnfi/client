<script lang="ts">
  import type { HTMLInputAttributes } from "svelte/elements";
  import WalletFull from "@/assets/WalletFull.svelte";

  type $$Props = HTMLInputAttributes & {
    id: string;
    label?: string;
    value: any;
    currency?: string;
    balance?: string;
    hint?: string;
    error?: string;
    "data-cy"?: string;
  };

  export let id: string;
  export let label = "";
  export let value: any;
  export let currency = "";
  export let balance = "";
  export let hint = "";
  export let error = "";

  let hasError = false;

  $: hasError = error != null && error.length > 0;
</script>

<label
  for={id}
  class="{hasError ? 'text-danger' : 'text-accent'} text-sm font-normal w-full"
>
  {label}
  <div class="h-2" />
  <div class="relative">
    {#if balance != null && balance.length > 0}
      <div
        class="absolute -top-7 right-0 text-xs font-medium text-body pl-1 flex items-end"
        data-cy="balance"
      >
        <WalletFull class="mr-1" />
        {balance}
      </div>
    {/if}
    <div class="flex">
      <div class="relative w-full">
        <input
          {id}
          class="h-12 sm:h-14 bg-transparent border {hasError
            ? 'border-danger'
            : 'border-muted'} text-accent text-xl font-bold rounded block w-full p-2 pr-1 sm:pr-2 pl-4 disabled:text-disabled disabled:cursor-default"
          {...$$restProps}
          bind:value
          on:input
        />
        {#if currency.length > 0}
          <div
            class="absolute top-2.5 right-3 sm:top-3 sm:right-4 bg-neutral-900 px-3 py-1 rounded text-sm sm:text-base font-bold text-accent"
            class:text--disabled={$$restProps.disabled}
            data-cy="currency"
          >
            {currency}
          </div>
        {/if}
      </div>
      <slot name="input-right" />
    </div>
  </div>
  {#if hint.length > 0 && !hasError}
    <legend class="text-xs text-body font-normal mt-2">{hint}</legend>
  {/if}
  {#if hasError}
    <legend>{error}</legend>
  {/if}
</label>

<style lang="postcss">
  /*
   * For some reason I had to overwrite this.
   * Notice the double dash '--' in the class name.
   */
  .text--disabled {
    @apply text-disabled;
  }
</style>
