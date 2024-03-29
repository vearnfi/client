<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { VariantProps } from "class-variance-authority";
  import { cva } from "class-variance-authority";
  import { Spinner } from "@/components/spinner";

  type ButtonVariantProps = VariantProps<typeof buttonVariants>;
  type $$Props = HTMLButtonAttributes &
    ButtonVariantProps & {
      loading?: boolean;
      "data-cy"?: string;
    };

  export let intent: ButtonVariantProps["intent"] = "secondary";
  export let size: ButtonVariantProps["size"] = "medium";
  export let fullWidth: ButtonVariantProps["fullWidth"] = false;
  export let disabled: ButtonVariantProps["disabled"] = false;
  export let loading: boolean = false;

  const buttonVariants = cva(["font-bold"], {
    variants: {
      intent: {
        primary: [
          "text-black",
          "bg-primary",
          "border",
          "border-lime-400", // TODO: add to palette
          "hover:bg-primary-100",
          "hover:border-primary",
        ],
        secondary: [
          "text-background",
          "bg-secondary",
          "border",
          "border-violet-400", // TODO: add to palette
          "hover:bg-secondary-100",
          "hover:border-secondary",
        ],
        danger: [
          "text-danger",
          "bg-body",
          "border",
          "border-danger",
          "hover:border-danger-100",
          "hover:bg-danger",
          "hover:text-body",
        ],
        outline: [
          "text-background",
          "bg-body",
          "border",
          "border-background", // TODO: add to palette
          "hover:border-lime-400", // TODO: add to palette
          "hover:bg-primary-100",
          "hover:border-primary",
        ],
      },
      size: {
        small: ["text-sm", "p-2", "px-3", "rounded-lg"],
        medium: ["text-base", "md:text-lg", "py-4", "px-6", "rounded-lg"],
      },
      fullWidth: {
        true: ["w-full"],
      },
      disabled: {
        true: [
          "cursor-not-allowed",
          "bg-disabled",
          "border-gray-400",
          "text-muted",
          "hover:bg-disabled",
          "hover:text-muted",
          "hover:border-gray-400",
        ],
      },
    },
  });
</script>

<button
  type="button"
  {disabled}
  on:click
  {...$$restProps}
  class={buttonVariants({
    intent,
    size,
    fullWidth,
    disabled,
    class: $$props.class,
  })}
>
  {#if loading}<Spinner data-cy="spinner" />{/if}
  <slot />
</button>
