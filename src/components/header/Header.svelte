<script lang="ts">
  import { Popover } from "svelte-smooth-popover";
  import { wallet } from "@/stores/wallet";
  import { balance } from "@/stores/balance";
  import { shortenAddress } from "@/utils/shorten-address";
  import { formatUnits } from "@/utils/format-units";
  import { ConnectWalletButton } from "@/components/connect-wallet-button";
  import { Button } from "@/components/button";
  import vearn from "@/assets/vearn.png";
  import ChevronDown from "@/assets/ChevronDown.svelte";

  /** Popover state. */
  let isOpen = false;

  function handleDisconnect() {
    wallet.disconnect();
    isOpen = false;
  }
</script>

<nav
  class="
    fixed top-0 w-full mx-auto h-16 z-20
    bg-background border-b md:border-x border-muted
    flex flex-wrap items-center justify-between
  "
  data-cy="navigation-bar"
>
  <div class="pl-2 pr-4 sm:px-6 sm:py-3">
    <img src={vearn} class="h-4 lg:h-5" alt="Vearn Finance" />
  </div>

  <div
    class="flex items-center justify-between pl-4 pr-2 sm:px-6 sm:py-3 sm:border-l space-x-2 md:space-x-8 border-muted h-full min-w-min sm:w-80"
  >
    {#if $wallet.connected && $balance.current != null}
      <div class="space-y-1">
        <p class="text-xs font-medium text-accent">
          {shortenAddress($wallet.account)}
        </p>
        <p class="text-xs font-medium">
          {formatUnits($balance.current.vet, 2)}&nbsp;VET&nbsp;
        </p>
      </div>

      <button
        class="hidden sm:block text-sm font-medium text-accent"
        on:click={handleDisconnect}
        data-cy="disconnect-wallet-button"
      >
        Disconnect
      </button>
      <button class="block sm:hidden" data-cy="open-dropdown-button">
        <ChevronDown class="inline-block text-inherit" />

        <Popover
          showOnClick
          hideOnExternalClick
          caretWidth={0}
          align="bottom-left"
          on:open={() => {
            isOpen = true;
          }}
          on:close={() => {
            isOpen = false;
          }}
        >
          <div
            class="flex flex-col space-y-2 bg-highlight border border-muted rounded-md px-4 py-3"
          >
            <div class="space-y-1">
              <p class="text-xs font-medium text-accent">
                {shortenAddress($wallet.account)}
              </p>
              <p class="text-xs font-medium">
                {formatUnits($balance.current.vet, 2)}&nbsp;VET&nbsp;
              </p>
            </div>
            <Button
              intent="outline"
              size="medium"
              on:click={handleDisconnect}
              data-cy="disconnect-wallet-button"
            >
              DISCONNECT
            </Button>
          </div>
        </Popover>
      </button>
    {:else}
      <ConnectWalletButton variant="icon" class="ml-auto sm:ml-0" />
    {/if}
  </div>
</nav>

<style>
  nav {
    height: var(--header-height);
    max-width: var(--app-width);
  }
</style>
