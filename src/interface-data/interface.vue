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
  padding: 2rem;
  background-color: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 12px;
  box-shadow: 0 2px 8px 0 rgba(42, 91, 215, 0.06);
  font-size: 1.08rem;
  color: #222;
  max-width: 900px;
  margin: 2rem auto;
}

.commerce-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 4px 0 rgba(42, 91, 215, 0.04);
}

.commerce-table th {
  background: #f5f8fa;
  color: #2a5bd7;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-bottom: 2px solid #e5eaf2;
  text-align: left;
  letter-spacing: 0.02em;
}

.commerce-table td {
  border-bottom: 1px solid #e5eaf2;
  padding: 0.75rem 1rem;
  vertical-align: top;
  background: #fff;
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
  padding: 0.15rem 0;
}

.amount {
  color: #2a5bd7;
  font-weight: 600;
}

.compare-at {
  color: #b91c1c;
  margin-left: 0.5em;
  text-decoration: line-through;
  font-size: 0.95em;
}

.quantity {
  color: #2a5bd7;
  font-weight: 600;
}

.commerce-table tr:last-child td {
  border-bottom: none;
}

@media (max-width: 700px) {
  .interface-box {
    padding: 0.5rem;
    font-size: 1rem;
  }
  .commerce-table th,
  .commerce-table td {
    padding: 0.5rem 0.3rem;
  }
}
</style>

<script lang="ts">
import { defineComponent, inject, watchEffect, ref } from "vue";
import { useApi } from "@directus/extensions-sdk";

export default defineComponent({
  name: "Commerce Data",
  props: {
    collection: {
      type: String,
      required: true,
    },
  },
  emits: ["input", "update:modelValue"],
  setup(props, { emit }) {
    const api = useApi();
    const commerce_data = ref({});

    let values:
      | { value: { skus?: string[] | undefined } }
      | { value: { code?: string | undefined } }
      | undefined;

    if (props.collection === "products") {
      values = inject<{ value: { skus?: string[] } }>("values");
    } else if (props.collection === "skus") {
      values = inject<{ value: { code?: string } }>("values");
    }

    const getCommerceData = async (skus: string[]) => {
      if (!skus || skus.length === 0) return;
      try {
        const response = await api.get("/cl-endpoint", { params: { skus } });

        if (response.status !== 200) {
          commerce_data.value = `Failed to fetch data: ${response.statusText}`;
        }
        if (Array.isArray(response.data)) {
          // Update Directus SKU models with the data from the endpoint
          // Assuming response.data is an array of SKU objects with a "code" property
          for (const skuData of response.data) {
            console.log("Processing SKU data:", skuData);
            if (skuData.code) {
              try {
                // Update the SKU item in Directus by code adding Commerce Layer ID
                await api.patch(`/items/skus/${skuData.code}`, {
                  cl_id: skuData.id,
                });
                // sync shipping category and update directus entry accordingly
                try {
                  await api.get(
                    `/items/shipping_categories/${skuData.shipping_category.id}`
                  );
                  // Exists, update
                  await api.patch(
                    `/items/shipping_categories/${skuData.shipping_category.id}`,
                    { name: skuData.shipping_category.name }
                  );

                  await api.patch(`/items/skus/${skuData.code}`, {
                    shipping_category: skuData.shipping_category.id,
                  });
                } catch (err: any) {
                  // Not found, create
                  await api.post(`/items/shipping_categories`, {
                    cl_id: skuData.shipping_category.id,
                    name: skuData.shipping_category.name,
                  });

                  emit("update:modelValue", {
                    shipping_category: skuData.shipping_category.id,
                  });
                }
              } catch (updateErr) {
                console.error(
                  `Failed to update SKU ${skuData.code}:`,
                  updateErr
                );
              }
            }
          }
        }
        commerce_data.value = response.data;
      } catch (err) {
        console.error("Error fetching commerce data:", err);
      }
    };

    watchEffect(() => {
      if (!values) return;

      let skus;

      // If collection is products, get skus from values
      // If collection is skus, get code from values

      if (props.collection === "products") {
        skus = values && "skus" in values.value ? values.value.skus : [];
      } else if (props.collection === "skus") {
        skus =
          values && "code" in values.value && values.value.code
            ? [values.value.code]
            : [];
      }

      if (skus) getCommerceData(skus);
    });

    return {
      commerce_data,
    };
  },
});
</script>
