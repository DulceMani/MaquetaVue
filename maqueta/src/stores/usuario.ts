import type { IUsuario } from "@/interfaces/iusuario";
import { defineStore } from "pinia";
import { registerRuntimeCompiler } from "vue";

export const useUsuarioStore = defineStore('usuario', {
  state: (): IUsuario => ({
    id: 0,
    nombre: '',
    a_paterno: '',
    a_materno: '',
    correo: '',
    clave: '',
    foto: null,
    fh_alta: null,
  }),
  actions: {
    estableceUsuario(usuario: IUsuario) {
      this.id = usuario.id;
      this.nombre = usuario.nombre;
      this.a_paterno = usuario.a_paterno;
      this.a_materno = usuario.a_materno;
      this.correo = usuario.correo;
      this.foto = usuario.foto;
      this.fh_alta = usuario.fh_alta;
    },
    destruyeUsuario() {
      this.id = 0;
      this.nombre = '';
      this.a_paterno = '';
      this.a_materno = '';
      this.correo = '';
      this.foto = '';
      this.fh_alta = '';
    }
  },
  getters: {
    getNombreCompleto: (state) => {
      return state.nombre + " " + state.a_paterno + " " + state.a_materno;
    }
  },
  persist: true
});

interface IUsuarios {
  usuarios: IUsuario[],
  index: number,
  indice: number
}

export const useUsuariosStore = defineStore("usuarios", {
  state:(): IUsuarios =>({
    usuarios: [],
    index: 0,
    indice: 0
  }),
  actions: {
    addUsuario(usuario: IUsuario){
      this.usuarios.push(usuario);
    },
    eliminaUsiario(id: number) {
      this.usuarios = this.usuarios.filter(us => us.id !== id);
    },
    setIndice(indice: Number) {
      this.indice = indice;
    }
  },
  getters: {
    getUsuarios :(state) => {
      return state.usuarios;
    },
    getLenUsuarios : (state) => {
      return state.usuarios.length;
    },
    getIndice : (state) => {
      return state.indice;
    }
  },
  persist: true
});