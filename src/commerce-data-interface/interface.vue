<template>
  <div class="interface-box">
    <div v-if="typeof commerce_data === 'string'">
      {{ commerce_data }}
    </div>
    <div v-else-if="Object.keys(commerce_data).length === 0">
      No data available.
    </div>
    <div v-else>
      <table class="commerce-table">
        <thead>
          <tr>
            <th>SKU</th>
            <th>Price Lists</th>
            <th>Stock Locations</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, idx) in commerce_data" :key="idx">
            <td>{{ row["code"] }}</td>
            <td>
              <ul class="price-list">
                <li v-for="(price, priceIdx) in row['prices']" :key="priceIdx">
                  <strong>{{ price["price_list"]["name"] }}</strong
                  >:
                  <span class="amount">{{ price["formatted_amount"] }}</span>
                  <span
                    v-if="price['formatted_compare_at_amount']"
                    class="compare-at"
                  >
                    (Compare: {{ price["formatted_compare_at_amount"] }})
                  </span>
                </li>
              </ul>
            </td>
            <td>
              <ul class="stock-list">
                <li
                  v-for="(stock, stockIdx) in row['stock_items']"
                  :key="stockIdx"
                >
                  <strong>{{ stock["stock_location"]["name"] }}</strong
                  >:
                  <span class="quantity">{{ stock["quantity"] }}</span>
                </li>
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.interface-box {
  padding: 1rem;
  background-color: #f0f9ff;
  border: 1px solid #cce;
  border-radius: 6px;
  font-size: 1.1rem;
  color: #333;
}

.commerce-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

.commerce-table th,
.commerce-table td {
  border: 1px solid #dde;
  padding: 0.5rem 0.75rem;
  vertical-align: top;
  text-align: left;
}

.price-list,
.stock-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.price-list li,
.stock-list li {
  margin-bottom: 0.25rem;
}

.amount {
  color: #1a7f37;
  font-weight: bold;
}

.compare-at {
  color: #b91c1c;
  margin-left: 0.5em;
  text-decoration: line-through;
}

.quantity {
  color: #2563eb;
  font-weight: bold;
}
</style>

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

        if (response.status !== 200) {
          commerce_data.value = `Failed to fetch data: ${response.statusText}`;
        }

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
