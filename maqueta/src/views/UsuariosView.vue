<template>
  <v-container>
    <v-card-item>
      <v-card-title>
        <v-row>
          <v-col lg="9" md="9" sm="7">
            <v-icon>mdi-account-multiple</v-icon>
            Lista de Usuarios
          </v-col>
          <v-col lg="3" md="3" sm="5"
            class="d-flex justify-end"
          >
            <v-btn prepend-icon="mdi-plus" 
              size="small"
              color="primary"
              @click="nuevoUsuario"
            >    Nuevo usuario
            </v-btn>
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
              :src="props.item.foto? getFoto(props.item.foto) : defaultFoto"
            ></v-img>
          </v-avatar>
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
      title="Cuidado"
      icon="mdi-paw"
      :btn-cancel="true"
      :btn-ok="true"
      :dialog="dialogAlert"
      :size="250"
      color="danger"
      @cancelar-modal="dialogAlert = false"
      @aceptar-cambios="eliminaUsuario"
    >
      Cuidado estas apunto de eliminar el registro del usuario se eliminara todo su historial.
    </Modal>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { reactive, ref } from 'vue';
import axios from 'axios'
import { API, base64ToUrl, PERMISOS } from '@/contantes';
import { useUsuarioStore, useUsuariosStore } from '@/stores/usuario';
import { storeToRefs } from 'pinia';
import type { IUsuario } from '@/interfaces/iusuario';
import type { IArchivo } from '@/interfaces/iarchivo';
import Tabla from '@/components/Tabla.vue';
import Modal from '@/components/Modal.vue';
import router from '@/router';
import defaultFoto from '@/assets/img/hombre.png';
const { getPermiso } = useUsuarioStore();

if (getPermiso !== PERMISOS.get("ADMIN")) {
  router.push("/home");
}

const paginacion = reactive({
  page: 1,
  length: 1,
  per_page: 5
});
const usuarios_st = useUsuariosStore()
const {eliminarUsiario} = usuarios_st;
const {usuarios} = storeToRefs(usuarios_st);
const dialog = ref(false);
const usuarioDialog = ref<IUsuario | null>(null);
const urlImg = ref('');
const archivo = ref<IArchivo | null>(null);
const dialogAlert = ref(false);
const usuarioDeleteId = ref(0);
const headers = [
  {
    titulo: "Foto",
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
const buscardor = ref(true);

/**************funciones**********/
onMounted (async () => {
  await traeUsuarios();
});
watch(usuarios.value, async () =>{
  await traeUsuarios();
});
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

const abrirDetalleUs = (usuario: IUsuario) => {
  if(usuario) {
    dialog.value = true;
    usuarioDialog.value = usuario;
  }
}

const nuevoUsuario = () => {
  usuarioDialog.value = null;
  dialog.value = true;
}

const alertaEliminaUs = (Id: number) => { 
  usuarioDeleteId.value = Id;
  dialogAlert.value = true;
}
const eliminaUsuario = async () => {
  try{
    
    let foto = perros.value.find(p => p.id == perroDeleteId.value).foto;
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
    dialogAlert.value = false;
  } catch(ex) {
    console.log(ex.message)
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

const getFoto = async (foto: Number) => {
  try {
    console.log(foto);
    if(foto) {
      const response = await axios({
        method: "GET",
        url: `${API}/archivos/${foto}`
      });
      archivo.value = response.data;
      urlImg.value = base64ToUrl(archivo.value?.datos, archivo.value?.tipo);
      return urlImg;
    }
    return '';
  } catch(ex) {
    console.log(ex.message);
  }
}
const irDetalle = (usuario_id: number) => {
  console.log(usuario_id)
  router.push({ name: `detalle-usuario`, params: {usuarioId: usuario_id}});

}
</script>

<style scoped>

</style>