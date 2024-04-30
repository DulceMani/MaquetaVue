<template>
  <div class="inicio-view bg-blue-lighten-5"
  >
    <v-row justify="center">
      <v-col lg="4" md="6" sm="8" xs="12"
      >
       <v-img
          class="w-50 img-init mx-auto"
          :src="perroLogim"
        >
        </v-img>
        
      </v-col>
    </v-row>
    <RouterView />
    
  </div>
</template>

<script setup lang="ts">
import { API } from '@/contantes'
import { RouterView } from "vue-router";
import perroLogim from '@/assets/img/perro1.jpg';
import { onMounted, ref } from "vue";
import { useIndicesStore } from "@/stores/indices";
import axios from 'axios';
import type { IIndice } from '@/interfaces/iindice';

/**declaraciones */
const {estableceIndices} = useIndicesStore();
const indices = ref<IIndice[]>([]);
/**funciones */
onMounted(() => {
  axios({
    method:"GET",
    url:`${API}/indices`
  })
  .then((response) => {
    indices.value = response.data;
    estableceIndices(indices.value);
  })

});
</script>

<style scoped lang="scss">
.inicio-view{
  text-align: center;
  margin: 0;
  padding: 0;
  background-image: url("../assets/img/fondologin.jpeg");
  min-height:100%;
  height: 100vh;
  width: 100%;
  background-position: center;
  background-repeat: repeat;
  background-size: cover;
  .img-init {
    border-radius: 50%;
    text-align: center;
  }
}
</style>