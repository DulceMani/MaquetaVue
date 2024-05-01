<template>
  <v-row justify="center">
    <v-col lg="4" md="6" sm="8" xs="12">
      <v-card title="Registrate" 
        subtitle="Llena todos los campos" 
        text="Vacunar previne"
        :loading="cargando"
      >
        <v-row class="m-2">
          <v-col cols="12">
            <v-form ref="formRef"
              @submit.prevent="registrarUsuario">
              <v-text-field 
                v-model="us_init.nombre" 
                label="Nombre" 
                required 
                :rules="rulesNombre"
              >
              </v-text-field>
              <v-text-field 
                v-model="us_init.a_paterno" 
                label="Primer apellido" 
                required 
                :rules="rulesNombre"
              >
              </v-text-field>
              <v-text-field 
                v-model="us_init.a_materno" 
                label="Segundo apellido" 
                required 
                :rules="rulesNombre"
              >
              </v-text-field>
              <v-text-field 
                v-model="us_init.correo" 
                label="Correo" 
                required 
                :rules="rulesCorreo"
                type="email"
              >
              </v-text-field>
              <v-text-field 
                v-model="us_init.clave" 
                label="Clave" 
                required 
                :rules="rulesPassword"
                type="password"
              >
              </v-text-field>
              <v-row class="mt-3">
                <v-col cols="6">
                  <v-btn 
                    color="primary"
                    class="me-4" 
                    :disabled="cargando"
                    type="submit"
                    block
                  >
                    Aceptar
                  </v-btn>
                </v-col>
                <v-col cols="6">
                  <v-btn @click="clear"
                    :disabled="cargando"
                    block
                  >
                    Limpiar
                  </v-btn>
                </v-col>
              </v-row>
            </v-form>
          </v-col>
        </v-row>
        <v-row>
          <v-card-text>
          Inicia Sesión <RouterLink to="/login">Log In</RouterLink>
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
import { API, fechaActual } from '@/contantes'
import { reactive, ref } from 'vue';
import axios from 'axios'
import { useUsuarioStore } from "@/stores/usuario";
import type { IUsuario } from '@/interfaces/iusuario';
import type { VForm } from "vuetify/components";
import router from '@/router';
import { storeToRefs } from 'pinia';
import { useIndicesStore } from '@/stores/indices';

/**declaraciones */
const usuario = useUsuarioStore();
const { id } = storeToRefs(usuario);
if(id.value !== 0) {
  router.push("/contenido");
}

const formRef = ref<null | VForm>(null)
const us_init = reactive<IUsuario>({
  id: 0,
  nombre: '',
  a_paterno: '',
  a_materno: '',
  correo: '',
  clave: '',
  foto: '',
  fh_alta: '',
});
const rulesNombre = [
  (valor:string) => !!valor || "El campo es requerido",
  (valor:string) => !!valor && valor.length >= 1 || "Debe tener al menos 1 caracteres"
];
const rulesCorreo = [
  (valor:string) => !!valor || "El campo es requerido",
  (valor:string) => !valor || /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(valor) || 'El correo tiene que ser valido'
];
const rulesPassword = [
  (valor:string) => !!valor || "El campo es requerido",
  (valor:string) => !!valor && valor.length >= 6 || "Debe tener al menos 6 caracteres"
]

const cargando = ref(false);
const indices_st = useIndicesStore();
const {getIndice, incrementaIndice, actualizaIndiceBD} = indices_st;
const indices = storeToRefs(indices_st);
const { estableceUsuario } = usuario;
const dialog = reactive({
  dialog: false,
  msj: 'Ocurrio algo! :O'
});

/**Funciones */
const clear = () => {
  us_init.id = 0;
  us_init.nombre = '';
  us_init.a_paterno = '';
  us_init.a_materno = '';
  us_init.correo = '';
  us_init.clave = '';
  us_init.foto = '';
  us_init.fh_alta = '';
}

const registrarUsuario = async () => {
  try {
    const {valid} = await formRef.value!.validate();
    if(valid){
      cargando.value = true;
      us_init.fh_alta = fechaActual();
      us_init.id = getIndice("usuario") + 1;
      us_init.id = us_init.id.toString();
      let resp  = await axios({
        method: 'POST',
        url: `${API}/usuario`,
        data: us_init
      });
      incrementaIndice("usuario");
      await actualizaIndiceBD("usuario");
      estableceUsuario(us_init);
      router.push("/contenido");
    }
    
    cargando.value = false;
    
  } catch (ex) {
    cargando.value = false;
    console.log(ex.message);
    dialog.msj = ex.message;
    dialog.dialog = true;

  }
}
</script>

<style scoped></style>