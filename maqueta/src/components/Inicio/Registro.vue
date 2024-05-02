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
  <Modal
    :title="dialog.titulo"
    icon="mdi-paw"
    :btn-ok="true"
    :dialog="dialog.dialog"
    :size="250"
    :color="dialog.color"
    @aceptar-cambios="dialog.dialog = false"
  >
    {{ dialog.msj }}
  </Modal>
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
import Modal from '@/components/Modal.vue'
import { onBeforeMount } from 'vue';

/**declaraciones */
const usuario = useUsuarioStore();
const { id } = storeToRefs(usuario);
const indices_st = useIndicesStore();
const {getIndice, incrementaIndice, actualizaIndiceBD} = indices_st;
const { estableceUsuario } = usuario;

const formRef = ref<null | VForm>(null);
const cargando = ref(false);

const us_init = reactive<IUsuario>({
  id: 0,
  nombre: '',
  a_paterno: '',
  a_materno: '',
  correo: '',
  clave: '',
  foto: '',
  fh_alta: '',
  tipo_us: 2,
  fh_nac: ''
});
const dialog = reactive({
  titulo: "Cuidado",
  dialog: false,
  msj: 'Ocurrio algo! :O',
  color: ""
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
];

/**Funciones */
onBeforeMount(()=>{
  if(id.value !== 0) {
    router.push("/contenido");
  }
})

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
    const usValid = await verificaUsurario();
    if(valid && usValid){
      cargando.value = true;
      us_init.fh_alta = fechaActual();
      us_init.id = getIndice("usuario") + 1;
      us_init.id = us_init.id.toString();
      const resp  = await axios({
        method: 'POST',
        url: `${API}/usuario`,
        data: us_init
      });
      incrementaIndice("usuario");
      await actualizaIndiceBD("usuario");
      estableceUsuario(us_init);
      router.push("/contenido");
    }else if(!usValid) {
      dialog.titulo = "Error";
      dialog.msj = "Ya existe usuario con ese correo";
      dialog.color = "warning"
      dialog.dialog = true;
    }
    
    cargando.value = false;
    
  } catch (ex) {
    cargando.value = false;
    console.log(ex.message);
    dialog.titulo = "Error";
    dialog.msj = ex.message;
    dialog.color = "danger"
    dialog.dialog = true;

  }
}
const verificaUsurario = async () => {
  const resp  = await axios({
    method: 'GET',
    url: `${API}/usuario?correo=${us_init.correo}`
  });
  if(resp.data.length > 0)
    return false;
  return true;
}
</script>

<style scoped></style>