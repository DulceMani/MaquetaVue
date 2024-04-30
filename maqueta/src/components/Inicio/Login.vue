<template>
  <v-row justify="center">
    <v-col lg="4" md="6" sm="8" xs="12">
      <v-card title="Iniciar" 
        subtitle="Introduce tus credenciales" 
        text="..." 
        :loading="cargando">
          <v-row class="m-2">
            <v-col cols="12">
              <v-form ref="formRef" 
                @submit.prevent="iniciar">
                <v-text-field 
                  v-model="credenciales.correo" 
                  label="Correo" 
                  required 
                  :rules="rulesCorreo" 
                  type="email"
                >
                </v-text-field>
                <v-text-field 
                  v-model="credenciales.clave" 
                  label="Clave" 
                  required 
                  :rules="rulesPassword" 
                  type="password"
                >
                </v-text-field>
                <v-btn 
                  color="primary" 
                  class="me-4" 
                  :disabled="cargando" 
                  type="submit"
                >
                  Aceptar
                </v-btn>
              </v-form>
            </v-col>
          </v-row>
          <v-row>
            <v-card-text>
              ¿No tienes cuenta? <RouterLink to="/registro">Registrate</RouterLink>
            </v-card-text>
          </v-row>
      </v-card>
    </v-col>
  </v-row>
  <v-dialog
    v-model="dialog.dialog" 
    width="auto"
  >
    <v-card 
      max-width="400" 
      prepend-icon="mdi-warning"
      :text="dialog.msj" 
      title="Warning"
    >
      <template v-slot:actions>
        <v-btn class="ms-auto" text="Cerrar" @click="dialog.dialog = false">
        </v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import { API } from '@/contantes'
import { reactive, ref } from 'vue';
import { IUsuario } from '@/interfaces/iusuario';
import type { VForm } from "vuetify/components";
import router from '@/router';
import axios from 'axios'
import { useUsuarioStore } from '@/stores/usuario';
import { storeToRefs } from 'pinia';

/**declaraciones */
const usuario_st = useUsuarioStore();
const { id } = storeToRefs(usuario_st);
if(id.value != 0) {
  router.push("/contenido");
}

const formRef = ref<null | VForm>(null)
const credenciales = reactive({
  correo: '',
  clave: ''
});
const rulesCorreo = [
  (valor: string) => !!valor || "El campo es requerido",
  (valor: string) => !valor || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(valor) || 'El correo tiene que ser valido'
];
const rulesPassword = [
  (valor: string) => !!valor || "El campo es requerido",
  (valor: string) => !!valor && valor.length >= 6 || "Debe tener al menos 6 caracteres"
]

const cargando = ref(false);
const dialog = reactive({
  dialog: false,
  msj: 'Ocurrio algo! :O'
});
const usuario = ref<null | IUsuario>(null);
const { estableceUsuario } = usuario_st;

/**funciones */
const iniciar = async () => {
  try {
    const {valid} = await formRef.value!.validate();
    if(valid){
      const resp  = await axios({
        method: 'GET',
        url: `${API}/usuario?correo=${credenciales.correo}&clave=${credenciales.clave}`,
      });

      if(resp.data.length > 0) {
        usuario.value = resp.data[0];
        estableceUsuario(usuario.value);
        router.push("/contenido");
      }else {
        dialog.msj = "Las credencialeas no coinciden";
        dialog.dialog = true;
      }
    }
  } catch(ex) {
    cargando.value = false;
    console.log(ex.message);
    dialog.msj = ex.message;
    dialog.dialog = true;
  }
};
</script>

<style scoped></style>