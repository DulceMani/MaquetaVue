<template>
  <v-container>
    <v-card-item>
      <v-card-title>
        <v-row>
          <v-col lg="9" md="9" sm="7">
            <v-icon>mdi-account-multiple</v-icon>
            Lista de Usuarios
          </v-col>
          
        </v-row>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <hr>
      <Tabla
        :headers="headers"
        :data="usuarios"
        :page="paginacion.page"
        :length="paginacion.length"
        :buscar="buscardor"
        @cambia-pagina="(page) => paginaTabla(page)"
        @buscador-text="(dato) => busuqedaDato(dato)"
        @cambia-num-registros="(dato) => cambiaNumRegistros(dato)"
      >
        <template v-slot:foto-slot="props">
          <v-avatar @click="irDetalle(props.item.id)">
            <v-img
              :alt="props.item.nombre"
              :src="props.item.foto != 0? fotosUs.find(f => f.index == props.index)?.fotoUrl : defaultFoto"
            ></v-img>
          </v-avatar>
        </template>
        <template v-slot:permiso-slot="props">
          {{ Permisos.find(p => p.id == props.item.tipo_us)?.text }}
        </template>
        <template v-slot:eliminar-slot="props">
          <v-btn color="danger" 
            size="small" 
            icon
            @click="alertaEliminaUs(props.item.id)"
          >
          <v-icon color="white">
              mdi-close
            </v-icon>
          </v-btn>
        </template>
      </Tabla>
    </v-card-text>
    <Modal
      :title="dialog.titulo"
      icon="mdi-paw"
      :btn-ok="true"
      :btn-cancel="dialog.btnCancel"
      :dialog="dialog.dialog"
      :size="250"
      :color="dialog.color"
      @aceptar-cambios="AceptarModal(dialog.funcionAceptar)"
      @cancelar-modal="dialog.dialog = false"
    >
      {{ dialog.msj }}
    </Modal>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, watch,reactive, ref, onBeforeMount } from 'vue';
import axios from 'axios'
import { API, base64ToUrl, PERMISOS } from '@/contantes';
import { Permisos, useUsuarioStore, useUsuariosStore } from '@/stores/usuario';
import { storeToRefs } from 'pinia';
import type { IUsuario } from '@/interfaces/iusuario';
import type { IArchivo } from '@/interfaces/iarchivo';
import Tabla from '@/components/Tabla.vue';
import Modal from '@/components/Modal.vue';
import router from '@/router';
import defaultFoto from '@/assets/img/hombre.png';

const usuarios_st = useUsuariosStore()
const {eliminarUsiario} = usuarios_st;
const { getIsAdmin } = useUsuarioStore();
const {usuarios} = storeToRefs(usuarios_st);

const usuarioDialog = ref<IUsuario | null>(null);
const urlImg = ref('');
const archivo = ref<IArchivo | null>(null);
const usuarioDeleteId = ref(0);
const buscardor = ref(true);

const paginacion = reactive({
  page: 1,
  length: 1,
  per_page: 5
});
const fotosUs = reactive([]);
const dialog = reactive({
  titulo: "Cuidado",
  dialog: false,
  msj: 'Ocurrio algo! :O',
  color: "",
  btnCancel: false,
  funcionAceptar: ''
});

const headers = [
  {
    titulo: "Detalle",
    slotName: "foto-slot",
    nameProp: ""
  },
  {
    titulo: "Nombre",
    slotName: "nombre",
    nameProp: "nombre"
  },
  {
    titulo: "Primer Apellido",
    slotName: "a_paterno",
    nameProp: "a_paterno"
  },
  {
    titulo: "Segundo Apellido",
    slotName: "a_materno",
    nameProp: "a_materno"
  },
  {
    titulo: "Correo",
    slotName: "correo",
    nameProp: "correo"
  },
  {
    titulo: "Fecha de Nacimieneto",
    slotName: "fh_nac",
    nameProp: "fh_nac"
  },
  {
    titulo: "Permiso",
    slotName: "permiso-slot",
    nameProp: ""
  },
  {
    titulo: "Fecha de registro",
    slotName: "fh_alta",
    nameProp: "fh_alta"
  },
  {
    titulo: "Eliminar",
    slotName: "eliminar-slot",
    nameProp: ""
  }
];


/**************funciones**********/
onBeforeMount(() => {
  if (!getIsAdmin) {
    router.push("/home");
  }
});
onMounted (async () => {
  await traeUsuarios();

  usuarios.value.map(async(us, i) => {
    let aux = {
      index: i,
      fotoUrl: await getFoto(us.foto)
    };
    fotosUs.push(aux);
  })
});
watch(usuarios.value, async () =>{
  await traeUsuarios();

});
watch(dialog, (nueVal) => {
  if(nueVal.dialog == false){
    dialog.titulo = "Cuidado";
    dialog.msj = "";
    dialog.color = "warning"
    dialog.dialog = false;
    dialog.btnCancel = false;
    dialog.funcionAceptar = "";
  }
})
const paginaTabla = async (page: number) =>{
  paginacion.page = page;
  await traeUsuarios();
}
const cambiaNumRegistros = async (per_page: number) =>{
  paginacion.per_page = per_page;
  await traeUsuarios();
}

const traeUsuarios = async () => {
  try {
    let response = await axios({
      method: "GET",
      url: `${API}/usuario?_sort=tipo_us&_page=${paginacion.page}&_per_page=${paginacion.per_page}`
    }); 
    paginacion.length = response.data.pages;
    usuarios.value = response.data.data;
    
  } catch(ex) {
    console.log(ex.message);
  }
}


const alertaEliminaUs = (Id: number) => { 
  usuarioDeleteId.value = Id;
  dialog.titulo = "Cuidado";
  dialog.msj = "Estas a punto de eliminar todo el registro de un usuario";
  dialog.color = "warning"
  dialog.dialog = true;
  dialog.btnCancel = true;
  dialog.funcionAceptar = "eliminaUsuario";
}
const eliminaUsuario = async () => {
  try{
    
    let foto = usuarios.value.find(p => p.id == usuarioDeleteId.value).foto;
    if(foto !==0){
      await axios({
        method: "DELETE",
        url: `${API}/archivos/${foto}`
      });
    }
    
    await axios({
      method: "DELETE",
      url: `${API}/usuario/${usuarioDeleteId.value}`
    });
    eliminarUsiario(usuarioDeleteId.value)
    dialog.titulo = "Usuario eliminado";
    dialog.msj = "Se elimino el usuario correctamente";
    dialog.color = "success"
    dialog.dialog = true;
    dialog.btnCancel = false;
  } catch(ex) {
    console.log(ex.message)
    dialog.titulo = "Error";
    dialog.msj = ex.message;
    dialog.color = "danger"
    dialog.dialog = true;
    dialog.btnCancel = false;
  }
}

const busuqedaDato = async (texto: String) => {
  try {
    let response = await axios({
      method: "GET",
      url: `${API}/usuario?_sort=fh_alta,nombre`
    }); 
    usuarios.value = response.data.filter(elemento => {
      // Convertir todos los valores de las propiedades del objeto a texto y buscar el texto
        return Object.values(elemento).some(valor => {
          return typeof valor === 'string' && valor.toLowerCase().includes(texto.toLowerCase());
      });
    }).slice(0, paginacion.per_page);
    
  } catch(ex) {
    console.log(ex.message);
  }
}

const getFoto = async (foto: Number): string => {
  try {
    if(foto) {
      const response = await axios({
        method: "GET",
        url: `${API}/archivos/${foto}`
      });
      archivo.value = response.data;
      urlImg.value = base64ToUrl(archivo.value?.datos, archivo.value?.tipo);
      return urlImg.value;
    }
    return '';
  } catch(ex) {
    console.log(ex.message);
  }
}
const irDetalle = (usuario_id: number) => {
  router.push({ name: `detalle-usuario`, params: {usuarioId: usuario_id}});
}

const AceptarModal = async (funcion: string) => {
  if(funcion == "eliminaUsuario") {
    await eliminaUsuario();
  }
    dialog.dialog = false;
  
}


</script>

<style scoped>

</style>