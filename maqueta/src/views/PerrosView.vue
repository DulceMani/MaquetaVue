<template>
  <v-container>
    <v-card-item>
      <v-card-title>
        <v-row>
          <v-col lg="9" md="9" sm="7">
            <v-icon>mdi-paw</v-icon>
            Lista de tus mascotas
          </v-col>
          <v-col lg="3" md="3" sm="5"
            class="d-flex justify-end"
          >
            <v-btn prepend-icon="mdi-plus" 
              size="small"
              color="primary"
              @click="nuevoPerro"
            >    Nueva Mascota
            </v-btn>
          </v-col>
        </v-row>
      </v-card-title>
    </v-card-item>
    <v-card-text>
      <hr>
      <Tabla
        :headers="headers"
        :data="perros"
        :page="paginacion.page"
        :length="paginacion.length"
        :buscar="buscardor"
        @cambia-pagina="(page) => paginaTabla(page)"
        @buscador-text="(dato) => busuqedaDato(dato)"
        @cambia-num-registros="(dato) => cambiaNumRegistros(dato)"
      >
        <template v-slot:detalle-slot="props">
          <v-btn color="primary" 
            size="small" 
            icon="mdi-paw"
            @click="abrirDetallePerro(props.item)"
          >
          </v-btn>
        </template>
        <template v-slot:evidencia-slot="props">
          <v-btn color="purple"
            size="small"
            icon="mdi-download"
            @click="descargarPDF(props.item.evidencia)"
            :disabled="props.item.evidencia === 0"
          >
          </v-btn>
          <a style="display: none;" :href="urlPDF" :id="'fileP'+props.item.evidencia" target="_blank"></a>
        </template>
        <template v-slot:eliminar-slot="props">
          <v-btn color="danger" 
            size="small" 
            icon
            @click="alertaElinaPerro(props.item.id)"
          >
          <v-icon color="white">
              mdi-close
            </v-icon>
          </v-btn>
        </template>
      </Tabla>
    </v-card-text>
    <FormPerro 
      :perro="perroDialog"
      :dialog="dialog" 
      @cierra-dialog="dialog = false"
    />
    <Modal
      title="Cuidado"
      icon="mdi-paw"
      :btn-cancel="true"
      :btn-ok="true"
      :dialog="dialogAlert"
      :size="250"
      color="danger"
      @cancelar-modal="dialogAlert = false"
      @aceptar-cambios="eliminarPerro"
    >
      Cuidado estas apunto de eliminar el registro del perro se eliminara todo su historial.
    </Modal>
  </v-container>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';
import { reactive, ref } from 'vue';
import axios from 'axios'
import { API, base64ToUrl } from '@/contantes';
import { useUsuarioStore } from '@/stores/usuario';
import { storeToRefs } from 'pinia';
import { usePerrosStore } from '@/stores/perros';
import FormPerro from '@/components/Perro/FormPerro.vue'
import type { IPerro } from '@/interfaces/iperro';
import type { IArchivo } from '@/interfaces/iarchivo';
import Tabla from '@/components/Tabla.vue';
import Modal from '@/components/Modal.vue';

/**declaraciones */
const usuario = useUsuarioStore();
const { id } = storeToRefs(usuario);
const paginacion = reactive({
  page: 1,
  length: 1,
  per_page: 5
});
const perros_st = usePerrosStore();
const { eliminaPerro } = perros_st;
const {perros} = storeToRefs(perros_st);
const dialog = ref(false);
const perroDialog = ref<IPerro | null>(null);
const urlPDF = ref('');
const archivo = ref<IArchivo | null>(null);
const dialogAlert = ref(false);
const perroDeleteId = ref(0);
const headers = [
  {
    titulo: "Detalle",
    slotName: "detalle-slot",
    nameProp: ""
  },
  {
    titulo: "Nombre",
    slotName: "nombre",
    nameProp: "nombre"
  },
  {
    titulo: "Edad",
    slotName: "edad",
    nameProp: "edad"
  },
  {
    titulo: "Raza",
    slotName: "raza",
    nameProp: "raza"
  },
  {
    titulo: "Fecha de registro",
    slotName: "fh_alta",
    nameProp: "fh_alta"
  },
  {
    titulo: "Evidencia",
    slotName: "evidencia-slot",
    nameProp: ""
  },
  {
    titulo: "Eliminar",
    slotName: "eliminar-slot",
    nameProp: ""
  }
];
const buscardor = ref(true);
/***********************funciones *************/
onMounted (async () => {
  await traePerros();
});
watch(perros.value, async () =>{
  await traePerros();
});


const paginaTabla = async (page: number) =>{
  paginacion.page = page;
  await traePerros();
}
const cambiaNumRegistros = async (per_page: number) =>{
  paginacion.per_page = per_page;
  await traePerros();
}

const traePerros = async () => {
  try {
    let response = await axios({
      method: "GET",
      url: `${API}/perros?_sort=fh_alta&_page=${paginacion.page}&_per_page=${paginacion.per_page}&usuario_id=${id.value}`
    }); 
    paginacion.length = response.data.pages;
    perros.value = response.data.data;
    
  } catch(ex) {
    console.log(ex.message);
  }
}

const abrirDetallePerro = (perro: IPerro) => {
  if(perro) {
    dialog.value = true;
    perroDialog.value = perro;
  }
}

const nuevoPerro = () => {
  perroDialog.value = null;
  dialog.value = true;
}

const descargarPDF =  async (evidencia: number) => {
  try {
    if(evidencia !== 0){
      const response = await axios({
        method: "GET",
        url: `${API}/archivos/${evidencia}`
      });
      archivo.value = response.data;
      urlPDF.value = base64ToUrl(archivo.value?.datos, archivo.value?.tipo);
      setTimeout(()=> document.getElementById('fileP'+evidencia).click(), 300);
    }
  } catch(ex) {
    console.log(ex.message);
  }
}

const alertaElinaPerro = (Id: number) => { 
  perroDeleteId.value = Id;
  dialogAlert.value = true;
}

const eliminarPerro  = async () => {
  try{
    console.log(perroDeleteId.value);
    let response = await axios({
      method: "GET",
      url: `${API}/vacunas?perro_id=${perroDeleteId.value}`
    });
    response.data.map(async (v) => {
      await axios({
        method: "DELETE",
        url: `${API}/vacunas/${v.id}`
      });
    })
    let evidencia = perros.value.find(p => p.id == perroDeleteId.value).evidencia;
    if(evidencia !==0){
      await axios({
        method: "DELETE",
        url: `${API}/archivos/${evidencia}`
      });
    }
    
    await axios({
      method: "DELETE",
      url: `${API}/perros/${perroDeleteId.value}`
    });
    eliminaPerro(perroDeleteId.value)
    dialogAlert.value = false;
  } catch(ex) {
    console.log(ex.message)
  }
}

const busuqedaDato = async (texto: String) => {
  try {
    let response = await axios({
      method: "GET",
      url: `${API}/perros?_sort=fh_alta,nombre`
    }); 
    perros.value = response.data.filter(elemento => {
      // Convertir todos los valores de las propiedades del objeto a texto y buscar el texto
        return Object.values(elemento).some(valor => {
          return typeof valor === 'string' && valor.toLowerCase().includes(texto.toLowerCase());
      });
    }).slice(0, paginacion.per_page);
    
  } catch(ex) {
    console.log(ex.message);
  }
}

</script>

<style scoped>

</style>