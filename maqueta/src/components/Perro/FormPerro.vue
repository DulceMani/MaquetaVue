<template>
  <v-dialog v-model="props.dialog" 
    max-width="800"
  >
    <v-card  prepend-icon="mdi-paw"
      title="Detalle de Mascota"
    >
      <v-card-text>
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
                label="Raza" 
                required 
                type="number"
                :rules="rulesEdad"
              ></v-text-field>
            </v-col>
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
        <v-row justify="center">
        <v-col cols="12">
          <v-table>
            <thead>
              <tr>
                <th></th>
                <th>Vacuna</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(vacunacion, i) in nuevasVacunaciones" :key="i">
                <td> <v-icon color="warning" icon="mdi-circle" /></td>
                <td>{{ nombreVacuna(vacunacion.vacuna_id) }}</td>
                <td>{{ vacunacion.fh_vacuna }}</td>
                <td>
                  <v-btn color="danger"
                    density="compact"
                    icon
                    @click="eliminarVacunacion(i,false)"
                  >
                    <v-icon color="white">
                      mdi-close
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
              <tr v-for="(vacunacion, i) in vacunaciones" :key="i">
                <td> <v-icon color="success" icon="mdi-check-circle" /></td>
                <td>{{ nombreVacuna(vacunacion.vacuna_id) }}</td>
                <td>{{ vacunacion.fh_vacuna }}</td>
                <td>
                  <v-btn color="danger"
                    density="compact"
                    icon
                    @click="eliminarVacunacion(vacunacion.id, true)"
                  >
                    <v-icon color="white">
                      mdi-close
                    </v-icon>
                  </v-btn>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-col>
      </v-row>
      <v-row justify="center">
        <v-col cols="8">
          <v-container class="max-width">
            <v-pagination
              v-model="paginacion.page"
              :length="paginacion.length"
              class="my-4"
            ></v-pagination>
          </v-container>
        </v-col>
      </v-row>
      </v-card-text>

      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn 
          text="Cancelar" 
          @click="cancelarCambios"
        >
        </v-btn>
        <v-btn
          color="primary"
          text="Guardar" 
          @click="guardarDetalle"
        >
        </v-btn>
      </template>
    </v-card>
    <v-dialog
      v-model="dialogVacuna"
      max-width="500"
    >
    <v-card  prepend-icon="mdi-paw"
      title="Vacunas"
    >
      <v-card-text>
        <v-row>
          <v-col lg="6" md="6" sm="12">
            <v-select
              v-model="formVacunacion.vacuna_id" 
              label="Selecciona Vacuna"
              :items="vacunas"
              item-title="nombre"
              item-value="id"
            ></v-select>
          </v-col>
          <v-col lg="6" md="6" sm="12">
            <v-text-field 
              v-model="formVacunacion.fh_vacuna"
              label="Raza" 
              required 
              type="date"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          text="Cancelar"
          variant="text"
          @click="dialogVacuna = false"
        ></v-btn>
        <v-btn
          color="primary"
          text="Aceptar"
          variant="text"
          @click="addVacunacion"
        ></v-btn>
      </v-card-actions>
    </v-card>
    </v-dialog>
  </v-dialog>
</template>

<script setup lang="ts">
import type { IVacunacion, IPerro } from '@/interfaces/iperro';
import type { IVacuna } from '@/interfaces/ivacuna';
import { onMounted, computed, ref, reactive, watch } from 'vue';
import { VForm } from 'vuetify/components';
import axios from 'axios';
import { API } from '@/contantes';
import { usePerrosStore } from '@/stores/perros';
import { useIndicesStore } from '@/stores/indices';
import { onBeforeMount } from 'vue';

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
  length: 5,
  per_page: 5
});
const perro = computed(()=> props.perro);
const emit = defineEmits(["cierraDialog"]);
const formRef = ref<null | VForm>(null);
const formPerro = reactive<IPerro>({
  id: 0,
  nombre: '',
  edad: 0,
  raza: '',
  usuario_id: 0,
  fh_alta: '',
  evidencia: [],
});
const formVacunacion = reactive<IVacunacion>({
  id: 0,
  vacuna_id: 0,
  fh_vacuna: '',
  perro_id: 0
});
const {setPerro} = usePerrosStore()

const rulesNombre = [
  (valor:string) => !!valor || "El campo es requerido",
  (valor:string) => !!valor && valor.length >= 1 || "Debe tener al menos 1 caracteres"
];
const rulesEdad = [
  (valor:number) => !!valor || "El campo es requerido y debe ser numerico"
];
const vacunas = ref<IVacuna[]>([]);
const dialogVacuna = ref(false);
const vacunaciones = ref<IVacunacion[]>([]);
const nuevasVacunaciones = ref<IVacunacion[]>([]);
const {getIndice, incrementaIndice, setIndice, actualizaIndiceBD} = useIndicesStore()

/**functions*/

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
  await traeVacunaciones();
});

const traeVacunaciones = async () => {
  try{
    console.log(`${API}/vacunas?_sort=-fh_vacuna&_page=${paginacion.page}&_per_page=${paginacion.per_page}&perro_id=${perro.value?.id}`)
    const response = await axios({
      method: "GET",
      url: `${API}/vacunas?_sort=-fh_vacuna&_page=${paginacion.page}&_per_page=${paginacion.per_page}&perro_id=${perro.value?.id}`
    });
    console.log(response.data)
    vacunaciones.value = response.data.data;
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
  
  emit('cierraDialog');
}

const nombreVacuna = (vacuna_id: number) => {
  let vacuna =  vacunas.value.find(v => v.id == vacuna_id);
  return vacuna?.nombre;
}
const addVacunacion = () => {
  let clon = {...formVacunacion};
  nuevasVacunaciones.value.push(clon);
  formVacunacion.vacuna_id = 0;
  formVacunacion.fh_vacuna = '';
  dialogVacuna.value = false;
}

const eliminarVacunacion = (vacunacion_id: number, enBD: boolean) =>{
  if(enBD){
    vacunaciones.value = vacunaciones.value?.filter(v => v.id !== vacunacion_id);
  }else{
    nuevasVacunaciones.value = nuevasVacunaciones.value.filter((v,i) => i !== vacunacion_id);
  }
}

const guardarDetalle = async () => {
  let indiceVaux = getIndice("vacunacion");
  try{
    if(perro.value.id !== 0) {
      nuevasVacunaciones.value.map(v=>{
        incrementaIndice("vacunacion");
        v.id = getIndice("vacunacion");
        console.log(v.id);
      });
      vacunaciones.value = [...vacunaciones.value, ...nuevasVacunaciones.value];
      const response = await axios({
        method:"PUT",
        url: `${API}/perros/${perro.value.id}`,
        data: formPerro
      });
      
      setPerro(response.data);
      await actualizaIndiceBD("vacunacion");
      nuevasVacunaciones.value = [];
    }
    emit('cierraDialog');
  } catch(ex) {
    console.log(ex.message);
    setIndice("vacunacion", indiceVaux);
    emit('cierraDialog');
  }
}

</script>

<style scoped></style>
