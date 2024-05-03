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
      <v-form  ref="formRef"
      >
        <v-row>
          <v-col lg="3" md="3" sm="12" cols="12">
            <v-row justify="center">
              <v-col cols="12">
                <v-img
                  class="w-50 img-init mx-auto"
                  :src="urlFoto ? urlFoto : perroLogim"
                >
                </v-img>
              </v-col>
              <v-col cols="12">
                <v-file-input
                  v-model="fotoFile"
                  :rules="rulesFoto"
                  accept="image/png, image/jpeg, image/bmp"
                  label="Foto"
                  placeholder="Selecciona Foto"
                  prepend-icon="mdi-camera"
                ></v-file-input>
              </v-col>
              
            </v-row>
          </v-col>
          <v-col cols="1" sm="0" xs="0">
            <div class="border"></div>
          </v-col>
          <v-col lg="8" md="8" sm="12">
            <v-row>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="usuarioDet.nombre"
                  :rules="rulesNombre"
                  label="Nombre"
                  required
                  :disabled="block"
                ></v-text-field>
              </v-col>

              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="usuarioDet.a_paterno"
                  :counter="10"
                  :rules="rulesNombre"
                  label="Primer Apellido"
                  required
                  :disabled="block"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="usuarioDet.a_materno"
                  :counter="10"
                  :rules="rulesNombre"
                  label="Segundo Apellido"
                  required
                  :disabled="block"
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="usuarioDet.correo"
                  label="Correo"
                  disabled      
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field
                  v-model="usuarioDet.fh_nac"
                  label="Fecha de Nacimiento"
                  type="date"    
                ></v-text-field>
              </v-col>
              <v-col
                cols="12"
                md="4"
              >
                <v-text-field 
                  v-model="usuarioDet.clave" 
                  label="Clave" 
                  required 
                  :rules="rulesPassword" 
                  type="password"
                ></v-text-field>
              </v-col>
              
              <v-col
                cols="12"
                md="4"
              >
                <v-select
                  v-model="usuarioDet.tipo_us"
                  :items="Permisos"
                  item-title="text"
                  item-value="id"
                  :disabled="!getIsAdmin"
                ></v-select>
              </v-col>
            </v-row>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
        <v-row class="d-flex justify-end">
          <v-col cols="12" md="2" class="d-flex justify-end">
            <v-btn
              text="Cancelar" 
              block
              @click="cancelarCambios"
            >
            </v-btn>

          </v-col>
          <v-col cols="12" md="2" class="d-flex justify-end">
            <v-btn
              color="primary"
              text="Aceptar"
              block
              @click="guardarPerfil"
            ></v-btn>
          </v-col>
        </v-row>
      </v-form>
    </v-card-text>
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
</v-container>
</template>

<script setup lang="ts">
import { useUsuarioStore, useUsuariosStore, Permisos} from '@/stores/usuario';
import type { IUsuario } from '@/interfaces/iusuario';
import { ref, reactive, onMounted } from 'vue';
import axios from 'axios';
import { API, fechaActual, fileToBytes, bytesToBase64, base64ToUrl } from '@/contantes';
import { computed } from 'vue';
import router from '@/router';
import { onBeforeMount } from 'vue';
import perroLogim from '@/assets/img/perro1.jpg';
import { VForm } from 'vuetify/components';
import type {IArchivo} from '@/interfaces/iarchivo'
import { useIndicesStore} from '@/stores/indices';
import Modal from '@/components/Modal.vue'
import { watch } from 'vue';

const props = defineProps({
  usuarioId: {
    type: String,
    default: 0
  }
});
const usuarioID = computed(() => props.usuarioId);

const usuario_st = useUsuarioStore();
const { getUsuarioID, getIsAdmin, estableceUsuario } = usuario_st;
const { setUsuario } = useUsuariosStore();
const indices_st = useIndicesStore();
const {getIndice, incrementaIndice, actualizaIndiceBD} = indices_st;

const formRef = ref<null | VForm>(null);
const miPerfil = ref(false);
const block = ref(false);
const archivo = ref<IArchivo | null>(null);
const fotoFile = ref<File | null>(null);
const cargando = ref(false);
const urlFoto = ref('');

const usuarioDet = reactive<IUsuario>({
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
const rulesFoto = [
  (value:File) => !value || !value.length || value[0].size < 2000000 || 'Foto solo a 2 MB!'
];

/**************************funciones*************** */
onBeforeMount(() => {
  if(!getIsAdmin && getUsuarioID != usuarioID ) {
    router.push("/home");
  }

})
onMounted(async () => {
  if(getUsuarioID == usuarioID){
    miPerfil.value = true;
  }
  await traeDatosUs();
});
watch(usuarioDet, async () => {
  await getFoto();
})

const traeDatosUs = async () => {
  try{
    const response = await axios({
      method: "GET",
      url: `${API}/usuario/${usuarioID.value}`
    });
    usuarioDet.id = response.data.id;
    usuarioDet.nombre = response.data.nombre;
    usuarioDet.a_paterno = response.data.a_paterno;
    usuarioDet.a_materno = response.data.a_materno;
    usuarioDet.correo = response.data.correo;
    usuarioDet.clave = response.data.clave;
    usuarioDet.fh_alta = response.data.fh_alta;
    usuarioDet.foto = response.data.foto;
    usuarioDet.fh_nac = response.data.fh_nac;
    usuarioDet.tipo_us = response.data.tipo_us;
  } catch(ex) {
    console.log(ex.message)
  }
}

const guardarPerfil = async () => {
  try {
    const {valid} = await formRef.value!.validate();
    if(valid){
      cargando.value = true;
      const response = await axios({
        method: "PUT",
        url: `${API}/usuario/${usuarioID.value}`,
        data: usuarioDet
      });
      setUsuario(usuarioDet);
      if(getUsuarioID == usuarioID) {
        estableceUsuario(usuarioDet);
      }
      await procesaFoto(); 
      cargando.value = false;
      dialog.titulo = "Guardado";
      dialog.msj = "Tu perfi se Guardo con exito";
      dialog.color = "success"
      dialog.dialog = true;
    }
  } catch (ex) {
    cargando.value = false;
    console.log(ex.message);
    dialog.titulo = "Error";
    dialog.msj = ex.message;
    dialog.color = "danger"
    dialog.dialog = true;
  }
}

const procesaFoto = async () => {
  console.log(fotoFile)
  if(fotoFile.value){
      await fileToBytes(fotoFile.value, async (bytes) => {
      archivo.nombre = fotoFile.value?.name;
      archivo.tipo = fotoFile.value?.type;
      archivo.datos = await bytesToBase64(bytes);
      await guardaArchivo();
    });
  }
}
const guardaArchivo = async () =>{
  try{
    if(usuarioDet.foto !== 0){
      archivo.id = usuarioDet.foto.toString();
      const response = await axios({
        method: "PUT",
        url: `${API}/archivos/${usuarioDet.foto}`,
        data: archivo
      });
    }else {
      archivo.id = (getIndice("archivo")+1).toString();
      const response = await axios({
        method: "POST",
        url: `${API}/archivos`,
        data: archivo
      });
      incrementaIndice("archivo");
      await actualizaIndiceBD("archivo");
      usuarioDet.foto = getIndice("archivo");
    }
    
    fotoFile.value = null;
    archivo.id = 0;
    archivo.datos = '';
    await axios({
      method: "PATCH",
      url: `${API}/usuario/${usuarioID.value}`,
      data: {"foto" : usuarioDet.foto}
    });
    setUsuario(usuarioDet);

    if(getUsuarioID == usuarioID) {
      estableceUsuario(usuarioDet)
    }
  } catch(ex) {
    console.log(ex.message);
  }
}
const getFoto =  async () => {
  try {
    if(usuarioDet.foto !== 0){
      const response = await axios({
        method: "GET",
        url: `${API}/archivos/${usuarioDet.foto}`
      });
      archivo.value = response.data;
      urlFoto.value = base64ToUrl(archivo.value?.datos, archivo.value?.tipo);
    }
  } catch(ex) {
    console.log(ex.message);
  }
}

const cancelarCambios = async () => {
  await traeDatosUs();
}
</script>

<style scoped>
.img-init {
  border-radius: 50%;
  text-align: center;
}
.border {
    width: 2px;
    height: 100%;
    border: 2px solid blue;
}
</style>