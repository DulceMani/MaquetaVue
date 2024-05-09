<template>
  <VApp>
    <v-toolbar
      color="primary"
      app
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title class="text-h5">
        <v-icon>mdi-paw</v-icon> Perro feliz <v-icon>mdi-paw</v-icon>
      </v-toolbar-title>

      <v-spacer></v-spacer>
      <v-btn icon :to="`/detalle-usuario/${getUsuarioID}`">
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-btn @click="salir">
        <v-icon>mdi-export</v-icon>
        Salir
      </v-btn>
    </v-toolbar>
    <v-navigation-drawer
        v-model="drawer"
        image="https://cdn.vuetifyjs.com/images/backgrounds/bg-2.jpg"
        theme="dark"
        temporary
        app
      >
        <v-list-item
          :prepend-avatar="imgHombre"
          :title="usuario.getNombreCompleto"
        ></v-list-item>

        <v-divider></v-divider>

        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-view-dashboard" title="Home" to="/" />
          <v-list-item prepend-icon="mdi-dog" title="Mis perritos" to="/perros" />
          <v-list-item v-if="getIsAdmin" prepend-icon="mdi-account-multiple" title="Usuarios" to="/usuarios" />
        </v-list>
    </v-navigation-drawer>
    <v-main>
      <v-row justify="center" class="m-5">
        <v-col lg="10" md="10" sm="11">
          <v-card>
            <RouterView />
          </v-card>
        </v-col>
      </v-row>
    </v-main>
  </VApp>
</template>

<script setup lang="ts">
import { ref, onBeforeMount } from 'vue';
import imgHombre from '@/assets/img/hombre.png';
import { useUsuarioStore } from '@/stores/usuario';
import router from '@/router';

/**declaraciones */
const usuario = useUsuarioStore();
const { destruyeUsuario, getUsuarioID, getIsAdmin } = usuario;

const drawer = ref(false);

/**funciones */
onBeforeMount(() => {
  if(getUsuarioID == 0){
    router.push("/login");
  }
})
const salir = () => {
  destruyeUsuario();
  router.push("/");
}

</script>

<style scoped>
.activo{
  color: black;
}
</style>