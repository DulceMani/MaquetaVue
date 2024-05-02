<template>
<v-container>
    <v-card-item>
      <v-card-title>
        <v-row>
          <v-col cols="12"
            class="d-flex justify-center"
          >
            <v-icon>mdi-account</v-icon>
            Mi perfil
          </v-col>
        </v-row>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <v-form>

      </v-form>
    </v-card-text>
</v-container>
</template>

<script setup lang="ts">
import { useUsuarioStore, useUsuariosStore} from '@/stores/usuario';
import type { IUsuario } from '@/interfaces/iusuario';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { API, PERMISOS } from '@/contantes';
import { computed } from 'vue';
import router from '@/router';
import { onBeforeMount } from 'vue';

const usuario_st = useUsuarioStore();
const { getUsuarioID, getPermiso } = usuario_st;



const props = defineProps({
  usuarioId: {
    type: String,
    default: 0
  }
})

const usuarioID = computed(() => props.usuarioId);
const usuarioDet = ref<IUsuario | null>(null);
const miPerfil = ref(false);


/**************************funciones*************** */
onBeforeMount(() => {
  if(getPermiso != PERMISOS.get("ADMIN") && getUsuarioID != usuarioID ) {
    router.push("/home");
  }

})
onMounted(async () => {
  if(getUsuarioID == usuarioID){
    miPerfil.value = true;
  }
  await traeDatosUs();
});

const traeDatosUs = async () => {
  try{
    const response = await axios({
      method: "GET",
      url: `${API}/usuario/${usuarioID.value}`
    });

    usuarioDet.value = response.data;
  } catch(ex) {
    console.log(ex.message)
  }
}
</script>

<style scoped></style>