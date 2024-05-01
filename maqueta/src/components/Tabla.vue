<template>
  <v-row justify="center">
    <v-col cols="12">
      <v-table >
        <thead>
          <tr>
            <th class="text-left" v-for="(head, i) in props.headers" :key="i">
              {{ head.titulo }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item,i) in props.data"
            :key="i"
          >
            <td v-for="(head, j) in props.headers" :key="j">
              <div v-if="isFieldSlot(head.slotName)">
                <slot 
                  :item="item"
                  :name="head.slotName"
                ></slot>
              </div>
              <div v-else>
                {{ obtenerDato(item, head.nameProp) }}
              </div>
            </td>
          </tr>
        </tbody>
      </v-table>
    </v-col>
  </v-row>

  <v-row justify="center">
    <v-col cols="8">
      <v-container class="max-width">
        <v-pagination
          :value="props.page"
          :length="props.length"
          class="my-4"
          @update:model-value="(page) => emit('cambiaPagina', page)"
        ></v-pagination>
      </v-container>
    </v-col>
  </v-row>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {defineProps, getCurrentInstance} from 'vue'

const props = defineProps({
  headers: {
    type: Array,
    default: []
  },
  data: {
    type: Array,
    default: []
  },
  page: {
    type: Number,
    default: 1
  },
  length: {
    type: Number,
    default: 1
  }
});
const emit = defineEmits(["cambiaPagina"]);

const  obtenerDato = (objeto: any, propiedad: string) => {
  return objeto[propiedad];
}
const isFieldSlot = (fieldName: string): boolean => {
  const instance = getCurrentInstance();
    // Verifica si existe una ranura con el nombre fieldName en $scopedSlots
    // Si el campo tiene una ranura asociada, entonces $scopedSlots[fieldName] tendrá un valor definido
    // Si no existe, $scopedSlots[fieldName] será 'undefined'
  return typeof instance.slots[fieldName] !== 'undefined';
}
</script>

<style scoped>

</style>