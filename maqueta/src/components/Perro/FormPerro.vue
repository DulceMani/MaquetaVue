<template>

  <Modal
    title="Detalle de Mascota"
    icon="mdi-paw"
    :btn-cancel="true"
    :btn-ok="true"
    :dialog="props.dialog"
    :size="800"
    @cancelar-modal="cancelarCambios"
    @aceptar-cambios="guardarDetalle"
  >
    <v-form ref="formRef">
      <v-row>
        <v-col sm="12" md="6" lg="6">
          <v-text-field 
            v-model="formPerro.nombre" 
            label="Nombre" 
            required 
            :rules="rulesNombre"
          ></v-text-field>
        </v-col>
        <v-col sm="12" md="6" lg="6">
          <v-text-field 
            v-model="formPerro.raza" 
            label="Raza" 
            required 
            :rules="rulesNombre"
          ></v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-col sm="12" md="6" lg="6">
          <v-text-field 
            v-model="formPerro.edad" 
            label="Edad" 
            required 
            type="number"
            :rules="rulesEdad"
          ></v-text-field>
        </v-col>
        <v-col sm="12" md="6" lg="6">
          <v-file-input
            v-model="fileEvidencia"
            label="Carnet"
            show-size
            accept="application/pdf"
          ></v-file-input>
        </v-col>
      </v-row>
      <v-row>
        <v-col sm="12" md="6" lg="6">
          <v-btn 
            prepend-icon="mdi-plus"
            append-icon="mdi-paw"
            @click="dialogVacuna = true"
          >
            Vacuna nueva
          </v-btn>
          
        </v-col>
      </v-row>
    </v-form>
    

    <Tabla
      :headers="headers"
      :data="dataTable"
      :page="paginacion.page"
      :length="paginacion.length"
      @cambia-pagina="(page) => paginacion.page = page"
    >
      <template v-slot:status-slot="props">
        <v-icon v-if="props.item.id !== 0" color="success" icon="mdi-check-circle" />
        <v-icon v-else color="warning" icon="mdi-circle" />
      </template>
      <template v-slot:vacuna-slot="props">
        {{ nombreVacuna(props.item.vacuna_id) }}
      </template>
      <template v-slot:eliminar-slot="props">
        <v-btn color="danger"
          density="compact"
          icon
          @click="showAlerDialog(props.item.id != 0? props.item.id: props.index, props.item.id !== 0)"
        >
          <v-icon color="white">
            mdi-close
          </v-icon>
        </v-btn>
      </template>
    </Tabla>
  </Modal>
  <Modal
    title="Vacunas"
    icon="mdi-paw"
    :btn-cancel="true"
    :btn-ok="true"
    :dialog="dialogVacuna"
    :size="500"
    @cancelar-modal="dialogVacuna = false"
    @aceptar-cambios="addVacunacion"
  >
    <v-form ref="formV">
      <v-card-text>
        <v-row>
          <v-col lg="6" md="6" sm="12">
            <v-select
              v-model="formVacunacion.vacuna_id" 
              label="Selecciona Vacuna"
              :items="vacunas"
              item-title="nombre"
              item-value="id"
              :rules="rulesSelect"
            ></v-select>
          </v-col>
          <v-col lg="6" md="6" sm="12">
            <v-text-field 
              v-model="formVacunacion.fh_vacuna"
              label="Raza" 
              required 
              type="date"
              :rules="rulesNombre"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
    </v-form>
  </Modal>
  
  <Modal
    title="Cuidado"
    icon="mdi-paw"
    :btn-cancel="true"
    :btn-ok="true"
    :dialog="dialogAlert"
    :size="250"
    @cancelar-modal="dialogAlert = false"
    @aceptar-cambios="eliminarVacunacion"
  >
    Cuidado estas apunto de eliminar un registro de vacunacion permanentemente.
  </Modal>

</template>

<script setup lang="ts">
import type { IVacunacion, IPerro } from '@/interfaces/iperro';
import type { IVacuna } from '@/interfaces/ivacuna';
import { onMounted, computed, ref, reactive, watch } from 'vue';
import { VForm } from 'vuetify/components';
import axios from 'axios';
import { API, fechaActual, fileToBytes, bytesToBase64 } from '@/contantes';
import { usePerrosStore } from '@/stores/perros';
import { useIndicesStore } from '@/stores/indices';
import { useUsuarioStore } from '@/stores/usuario';
import type { IArchivo } from '@/interfaces/iarchivo';
import Modal from '@/components/Modal.vue';
import Tabla from '@/components/Tabla.vue';

/**declaraciones */
const props = defineProps({
  perro: {
    type: Object as () => IPerro | null,
    default: null
  },
  dialog: {
    type: Boolean,
    default: false
  }
});
const paginacion = reactive({
  page: 1,
  length: 1,
  per_page: 5
});
const perro = computed(()=> props.perro);
const emit = defineEmits(["cierraDialog"]);
const formRef = ref<null | VForm>(null);
const formV  = ref<null | VForm>(null);
const formPerro = reactive<IPerro>({
  id: 0,
  nombre: '',
  edad: 0,
  raza: '',
  usuario_id: 0,
  fh_alta: '',
  evidencia: 0,
});
const formVacunacion = reactive<IVacunacion>({
  id: 0,
  vacuna_id: 0,
  fh_vacuna: '',
  perro_id: 0
});
const archivo = reactive<IArchivo>({
  id: 0,
  nombre: '',
  tipo: '',
  datos: ''
});
const {setPerro, addPerro} = usePerrosStore()

const rulesNombre = [
  (valor:string) => !!valor || "El campo es requerido",
  (valor:string) => !!valor && valor.length >= 1 || "Debe tener al menos 1 caracteres"
];
const rulesEdad = [
  (valor:number) => !!valor || "El campo es requerido y debe ser numerico"
];

const rulesSelect = [
  valor => !!valor || "Es necesario seleccionar un elemento"
];
const vacunas = ref<IVacuna[]>([]);
  const headers = [
  {
    titulo: "Estado",
    slotName: "status-slot",
    nameProp: ""
  },
  {
    titulo: "Vacuna",
    slotName: "vacuna-slot",
    nameProp: "fh_vacuna"
  },
  {
    titulo: "Fecha",
    slotName: "fh_vacuna",
    nameProp: "fn_vacuna"
  },
  {
    titulo: "Eliminar",
    slotName: "eliminar-slot",
    nameProp: ""
  },
];
const dataTable = computed(() => [...nuevasVacunaciones.value, ...vacunaciones.value ])
const dialogVacuna = ref(false);
const vacunaciones = ref<IVacunacion[]>([]);
const nuevasVacunaciones = ref<IVacunacion[]>([]);
const {getIndice, incrementaIndice, setIndice, actualizaIndiceBD} = useIndicesStore()
const dialogAlert = ref(false);
const vacunacionDeleted = reactive({
  indicador: 0,
  inBD: false
});
const { getUsuarioID } = useUsuarioStore();
const fileEvidencia = ref<File | null>(null);

/******************************functions****************************/

onMounted(async () => {
  try {
    const response = await axios({
      method: "GET",
      url: `${API}/vacuna`
    });
    vacunas.value = response.data;
  } catch(ex) {
    console.log(ex.message);
  }
  
});
watch(perro, async () => {
  formPerro.id = perro.value?.id;
  formPerro.nombre = perro.value?.nombre;
  formPerro.edad = perro.value?.edad;
  formPerro.raza = perro.value?.raza;
  formPerro.usuario_id = perro.value?.usuario_id;
  formPerro.evidencia = perro.value?.evidencia;
  formPerro.fh_alta = perro.value?.fh_alta;
  await traeVacunaciones();
}
);
watch(paginacion, async () =>{
  await traeVacunaciones();
});

const traeVacunaciones = async () => {
  try{
    if(perro.value?.id !== 0){
      const response = await axios({
        method: "GET",
        url: `${API}/vacunas?_sort=-fh_vacuna&_page=${paginacion.page}&_per_page=${paginacion.per_page}&perro_id=${perro.value?.id}`
      });
      paginacion.length = response.data.pages;
      vacunaciones.value = response.data.data;
    }
  } catch(ex) {
    console.log(ex.message);
  }
}

const cancelarCambios = () => {
  formPerro.id = perro.value?.id;
  formPerro.nombre = perro.value?.nombre;
  formPerro.edad = perro.value?.edad;
  formPerro.raza = perro.value?.raza;
  formPerro.usuario_id = perro.value?.usuario_id;
  formPerro.evidencia = perro.value?.evidencia;
  formPerro.fh_alta = perro.value?.fh_alta;
  emit('cierraDialog');
}

const nombreVacuna = (vacuna_id: number) => {
  let vacuna =  vacunas.value.find(v => v.id == vacuna_id);
  return vacuna?.nombre;
}
const addVacunacion = async () => {
  const {valid} = await formV.value!.validate();
  if(valid){
    let clon = {...formVacunacion};
    nuevasVacunaciones.value.push(clon);
    formVacunacion.vacuna_id = 0;
    formVacunacion.fh_vacuna = '';
    dialogVacuna.value = false;
  }
}

const eliminarVacunacion = async () =>{
  if(vacunacionDeleted.inBD) {
    const response = await axios({
      method:"DELETE",
      url: `${API}/vacunas/${vacunacionDeleted.indicador}`,
      data: formPerro
    });

    vacunaciones.value = vacunaciones.value?.filter(v => v.id !==vacunacionDeleted.indicador);
  }else{
    nuevasVacunaciones.value = nuevasVacunaciones.value.filter((v,i) => i !== vacunacionDeleted.indicador);
  }
  dialogAlert.value = false;
}

const guardarDetalle = async () => {
  try{
    const {valid} = await formRef.value!.validate();
    if(valid){
      if(formPerro.id !== 0) {
        const response = await axios({
          method:"PUT",
          url: `${API}/perros/${formPerro.id}`,
          data: formPerro
        });
        setPerro(response.data);
      }else {
        formPerro.id = (getIndice("perro") + 1).toString();
        formPerro.fh_alta = fechaActual();
        formPerro.usuario_id = getUsuarioID;

        const response = await axios({
          method:"POST",
          url: `${API}/perros`,
          data: formPerro
        });
        addPerro(response.data);
        incrementaIndice("perro");
        await actualizaIndiceBD("perro");
      }
      
      await procesaEvidencia(); 
      await guardaVacunaciones();
      emit('cierraDialog');
    }
  } catch(ex) {
    console.log(ex.message);
    emit('cierraDialog');
  }
}

const guardaVacunaciones = async () => {
  let indiceVaux = getIndice("vacunacion");
  try {
    let metodo = "PUT";
    let url = `${API}/vacunas`
    vacunaciones.value = [...vacunaciones.value, ...nuevasVacunaciones.value];
    vacunaciones.value.map(async vacunacion => {
      if(vacunacion.id == 0){
        incrementaIndice("vacunacion");
        vacunacion.id = getIndice("vacunacion").toString();
        vacunacion.perro_id = formPerro.id;
        metodo = "POST";
        url = `${API}/vacunas`
      }else {
        metodo = "PUT";
        url = `${API}/vacunas/${vacunacion.id}`
      }
      let response = await axios({
          method: metodo,
          url: url,
          data: vacunacion
        });
    });
   
    await actualizaIndiceBD("vacunacion");
    nuevasVacunaciones.value = [];
  }catch(ex) {
    console.log(ex.message);
    setIndice("vacunacion", indiceVaux);
  }
}

const showAlerDialog = (indicador: number, inBD: boolean) => {
  vacunacionDeleted.indicador = indicador;
  vacunacionDeleted.inBD = inBD;
  dialogAlert.value = true;
}

const procesaEvidencia = async () => {
  if(fileEvidencia){
      await fileToBytes(fileEvidencia.value, async (bytes) => {
      archivo.nombre = fileEvidencia.value?.name;
      archivo.tipo = fileEvidencia.value?.type;
      archivo.datos = await bytesToBase64(bytes);
      await guardaArchivo();
    });
  }
}

const guardaArchivo = async () =>{
  try{
    if(formPerro.evidencia !== 0){
      archivo.id = formPerro.evidencia.toString();
        const response = await axios({
        method: "PUT",
        url: `${API}/archivos/${formPerro.evidencia}`,
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
      formPerro.evidencia = getIndice("archivo");
    }
    
    fileEvidencia.value = null;
    archivo.id = 0;
    archivo.datos = '';
    await axios({
      method: "PATCH",
      url: `${API}/perros/${formPerro.id}`,
      data: {"evidencia" : formPerro.evidencia}
    });
    setPerro(formPerro);
  } catch(ex) {
    console.log(ex.message);
  }
}


</script>

<style scoped></style>
