<template>
  <v-row v-if="props.buscar">
    <v-col cols="6">
      <div class="select-table">
      <v-select
        :value="props.per_page"
        :items="[5, 10, 50, 100]"
        @update:modelValue="(dato) => emit('cambiaNumRegistros', dato)"
      ></v-select>

      </div>
    </v-col>
    <v-col cols="6" 
      class="d-flex justify-end"
    >
      <div class="buscador-table">
        <v-text-field 
          label="Buscar" 
          required 
          type="text"
          class=""
          @update:modelValue="(dato) => emit('buscadorText', dato)"
        ></v-text-field>
      </div>
    </v-col>
  </v-row>
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
                  :index="i"
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
import { getCurrentInstance} from 'vue'

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
  per_page:{
    type: Number,
    default: 5
  },
  length: {
    type: Number,
    default: 1
  },
  buscar: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(["cambiaPagina", "cambiaNumRegistros", "buscadorText"]);

const  obtenerDato = (objeto: any, propiedad: string) => {
  return objeto[propiedad];
}
const isFieldSlot = (fieldName: string): boolean => {
  const instance = getCurrentInstance();
  return typeof instance.slots[fieldName] !== 'undefined';
}
</script>

<style scoped>
.select-table {
  width: 10%;
  min-width: 4rem;
}
.buscador-table {
  width: 40%;
  min-width: 5rem;
}
</style>