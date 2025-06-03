<template>
  <div class="interface-box">
    <p>{{ JSON.stringify(commerce_data, null, 2) }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, inject, watchEffect, ref } from "vue";
import { useApi } from "@directus/extensions-sdk";

export default defineComponent({
  name: "Commerce Data",
  props: {
    modelValue: {
      type: [String, Array, Object],
      default: null,
    },
  },
  setup() {
    const api = useApi();
    const commerce_data = ref({});
    const values = inject<{ value: { skus?: string[] } }>("values");

    const getCommerceData = async (skus: string[]) => {
      if (!skus || skus.length === 0) return;
      try {
        const response = await api.get("/cl-endpoint", { params: { skus } });
        commerce_data.value = response.data;
      } catch (err) {
        console.error("Error fetching commerce data:", err);
      }
    };

    watchEffect(() => {
      const skus = values?.value?.skus;
      if (skus) getCommerceData(skus);
    });

    return {
      commerce_data,
    };
  },
});
</script>

<style scoped>
.interface-box {
  padding: 1rem;
  background-color: #f0f9ff;
  border: 1px solid #cce;
  border-radius: 6px;
  font-size: 1.2rem;
  text-align: center;
  color: #333;
}
</style>
