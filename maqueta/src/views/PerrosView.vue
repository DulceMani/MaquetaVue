<template>
  <v-container>
    <v-card-item>
      <v-card-title>
        Lista de tus mascotas
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-row justify="center">
        <v-col cols="12">
          <v-table height="300px">
            <thead>
              <tr>
                <th class="text-left">
                  Nombre
                </th>
                <th class="text-left">
                  Edad
                </th>
                <th class="text-left">
                  Raza
                </th>
                <th class="text-left">
                  Detalle
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="perro in perros"
                :key="perro.id"
              >
                <td>{{ perro.nombre }}</td>
                <td>{{ perro.edad }}</td>
                <td>{{ perro.raza }}</td>
                <td>
                  <v-btn color="primary" 
                    size="small" 
                    icon="mdi-paw"
                    @click="abrirDetallePerro(perro)"
                  >
                  </v-btn>
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
              v-model="paginacion.page"
              :length="paginacion.length"
              class="my-4"
            ></v-pagination>
          </v-container>
        </v-col>
      </v-row>
    </v-card-text>
    <FormPerro 
      :perro="perroDialog"
      :dialog="dialog" 
      @cierra-dialog="dialog = false"/>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { reactive, ref } from 'vue';
import axios from 'axios'
import { API } from '@/contantes';
import { useUsuarioStore } from '@/stores/usuario';
import { storeToRefs } from 'pinia';
import { usePerrosStore } from '@/stores/perros';
import FormPerro from '@/components/Perro/FormPerro.vue'
import type { IPerro } from '@/interfaces/iperro';

/**declaraciones */
const usuario = useUsuarioStore();
const { id } = storeToRefs(usuario);
const paginacion = reactive({
  page: 1,
  length: 5
});
const perros_st = usePerrosStore()
const {perros} = storeToRefs(perros_st);
const dialog = ref(false);
const perroDialog = ref<IPerro | null>(null);


/**funciones */
onMounted (async () => {
  try {
    let response = await axios({
      method: "GET",
      url: `${API}/perros?_page=${paginacion.page}&usuario_id=${id.value}`
    }); 
    paginacion.length = response.data.pages
    perros.value = response.data.data;
    
  } catch(ex) {
    console.log(ex.message);
  }
});

const abrirDetallePerro = (perro: IPerro) => {
  if(perro){
    dialog.value = true;
    perroDialog.value = perro;
  }
}

</script>

<style scoped>

</style>