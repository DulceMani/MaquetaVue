<template>
  <v-container>
    <v-card-item>
      <v-card-title>
        Maqueta de aplicación
      </v-card-title>

      <v-card-subtitle>
        Desarrollo para CustomSoft
      </v-card-subtitle>
    </v-card-item>
    <v-card-text>
     
      <v-row>
        <v-col lg="6">
          <h3>Esta maqueta consiste en el registro de perros y sus vacunas.</h3>
          <ul>
            <li>
              Crear eliminar, modificar datos del Perro
            </li>
            <li>Crear eliminar, vacunas del perro</li>
            <li>Para usuario Admin , eliminar y modificar, usuarios y vacunas.
              <ul>
                <li>correo: dulce@mail.com</li>
                <li>clave: 123456</li>
              </ul>
            </li>
          </ul>
        </v-col>
        <v-col>
          <h1>Por amor a los animales</h1>
          <h2>Cuida tus mascotas.</h2>
          <v-img :src="perritosImg">
          </v-img>
        </v-col>
      </v-row>
    </v-card-text>
  </v-container>
</template>
<script setup lang="ts">
import perritosImg from '../assets/img/perritos.jpg'
</script>
