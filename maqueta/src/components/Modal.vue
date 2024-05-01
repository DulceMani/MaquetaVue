<template>
  <v-dialog
    v-model="props.dialog"
    :max-width="size"
    
  >
    <v-card
      :prepend-icon="icon"
      :title="props.title"
    >
    <v-card-text>
      <slot></slot>
    </v-card-text>
      <template v-slot:actions>
        <v-spacer></v-spacer>
        <v-btn v-if="props.btnCancel"
          text="Cancelar" 
          @click="emit('cancelarModal')"
        >
        </v-btn>
        <v-btn v-if="props.btnOk"
          color="primary"
          text="Aceptar"
          @click="emit('aceptarCambios')"
        ></v-btn>
      </template>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
const props = defineProps({
  dialog: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  btnOk: {
    type: Boolean,
    default: false
  },
  btnCancel: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: ''
  },
  size: {
    type: Number,
    default: 300
  }
});

const emit = defineEmits(['cancelarModal', 'aceptarCambios']);

</script>

<style scoped>

</style>