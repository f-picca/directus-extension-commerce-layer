<template>
  <div style="display: block; margin-bottom: 1em">
    <VButton @click="redirectToSkuPage"> View Sku in Commerce Layer </VButton>
  </div>
  <div style="display: block; margin-bottom: 1em">
    <VDivider>Create checkout links</VDivider>
  </div>
  <div style="display: block; margin-bottom: 1em">
    <VSelect
      v-model="selected_country"
      :items="countries"
      @update:model-value="onCountrySelected"
    />
  </div>
  <div style="display: block">
    <VButton :disabled="!selected_country" @click="redirectToCheckoutLink">
      Create Sales Link
    </VButton>
  </div>
</template>

<script lang="ts">
import { useApi } from "@directus/extensions-sdk";
import { defineComponent, inject, ref, watchEffect } from "vue";

export default defineComponent({
  name: "Commerce Links",
  props: {
    collection: {
      type: String,
      default: null,
    },
    commerce_layer_dashboard_url: {
      type: String,
      default: null,
    },
  },
  setup(props) {
    const api = useApi();
    const countries = ref([{ text: "Select a country", value: null }]);
    const selected_country = ref(null);
    let selected_sku: string | undefined;

    if (props.collection !== "skus") {
      throw new Error("This component is only for the skus collection.");
    }

    const values = inject<{ value: { code: string } }>("values");

    function redirectToSkuPage() {
      if (!selected_sku) {
        console.error("No SKU selected.");
        return;
      }
      try {
        const url = `${props.commerce_layer_dashboard_url}apps/skus/${selected_sku}`;
        window.open(url, "_blank");
      } catch (error) {
        console.error("Error opening SKU link:", error);
      }
    }

    async function redirectToCheckoutLink() {
      if (!selected_country.value || !selected_sku) {
        console.error("Country or SKU not selected.");
        return;
      }
      try {
        const response = await api.get("/cl-endpoint/salesLink", {
          params: { sku: selected_sku, market: selected_country.value },
        });

        if (response.status !== 200) {
          console.error("Failed to create checkout link:", response.statusText);
          return;
        }

        console.log("Checkout link created:", response.data);
        // window.open(response.data, "_blank");
      } catch (error) {
        console.error("Error opening checkout link:", error);
      }
    }

    function onCountrySelected(value: any) {
      selected_country.value = value;
    }

    watchEffect(() => {
      selected_sku = values?.value.code || undefined;
    });

    async function fetchCountries() {
      try {
        const response = await api.get("/items/countries");

        if (response.status === 200) {
          countries.value = [
            { text: "Select a country", value: null },
            ...response.data.data.map((country: any) => ({
              text: country.name,
              value: country.market,
            })),
          ];
        } else {
          console.error("Failed to fetch countries:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching countries:", error);
      }
    }

    fetchCountries();

    return {
      redirectToSkuPage,
      countries,
      selected_country,
      selected_sku,
      onCountrySelected,
      redirectToCheckoutLink,
    };
  },
});
</script>
