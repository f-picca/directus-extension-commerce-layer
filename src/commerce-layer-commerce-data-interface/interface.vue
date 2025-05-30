<template>
	<div class="interface-box">
	  <p>Interface Loaded 🎉 {{ commerce_layer_integration_id }} {{ commerce_layer_integration_secret }}</p>
	</div>
  </template>
  
  <script lang="ts">
  import { defineComponent, PropType } from 'vue';
  
  export default defineComponent({
	name: 'cl-commerce-data-panel',
	props: {
        commerce_layer_integration_id: {
			type: String as PropType<string>,
			required: true
		},
        commerce_layer_integration_secret: {
			type: String as PropType<string>,
			required: true
		}
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