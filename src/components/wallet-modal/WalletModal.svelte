<script lang="ts">
  import type { WalletId } from "@/typings/types";
  import { wallet } from "@/stores/wallet";
  import { walletModal } from "@/stores/wallet-modal";
  import { Modal } from "@/components/modal";
  import { Button } from "@/components/button";
  import Sync2Icon from "@/assets/Sync2.svg";
  import VeWorldIcon from "@/assets/VeWorld.svg";

  const WALLET_PROVIDERS: {
    id: WalletId;
    label: string;
    icon: string;
  }[] = [
    { id: "sync2", label: "Sync2", icon: Sync2Icon },
    { id: "veworld", label: "VeWorld", icon: VeWorldIcon },
  ];

  let error: string | undefined;

  function handleClose() {
    walletModal.close();
    error = undefined;
  }

  async function handleConnect(walletId: WalletId) {
    error = undefined;
    await wallet.connect(walletId);
  }

  $: error = $wallet.error;

  $: {
    if ($wallet.connected) {
      handleClose();
    }
  }
</script>

<Modal
  isOpen={$walletModal.isOpen}
  on:close={handleClose}
  data-cy="wallet-modal"
>
  <svelte:fragment slot="header">Connect Wallet</svelte:fragment>
  <svelte:fragment slot="body">
    <!-- <p class="text-sm ">
      Connect with one of our available wallet providers.
    </p> -->
    <div class="flex flex-col space-y-3 my-4">
      {#each WALLET_PROVIDERS as { id, label, icon }}
        <Button
          fullWidth
          size="large"
          disabled={$wallet.loading}
          loading={$wallet.walletId === id && $wallet.loading}
          class="flex items-center justify-start"
          on:click={async () => {
            await handleConnect(id);
          }}
          data-cy={`wallet-provider-button-${id}`}
        >
          <img
            src={icon}
            class="inline h-6 sm:h-8 mr-3 align-top"
            alt={`${label} icon`}
          />
          {label}
        </Button>
      {/each}
    </div>

    {#if error != null}
      <p class="text-sm text-danger" data-cy="wallet-modal-error">
        ERROR: {error}
      </p>
    {/if}
  </svelte:fragment>
</Modal>
