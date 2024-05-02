import { PERMISOS } from "@/contantes";
import type { IUsuario } from "@/interfaces/iusuario";
import { defineStore } from "pinia";

export const Permisos = [
  { id: 1, text: "Administrador" },
  { id: 2, text: "Edicion" },
  { id: 3, text: "Solo lectura" },
]
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
    fh_nac: null,
    tipo_us: 2
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
      this.tipo_us = usuario.tipo_us;
      this.fh_nac = usuario.fh_nac;
    },
    destruyeUsuario() {
      this.id = 0;
      this.nombre = '';
      this.a_paterno = '';
      this.a_materno = '';
      this.correo = '';
      this.foto = '';
      this.fh_alta = '';
      this.tipo_us = 2;
    }
  },
  getters: {
    getNombreCompleto: (state) => {
      return state.nombre + " " + state.a_paterno + " " + state.a_materno;
    },
    getUsuarioID: (state) => {
      return state.id;
    },
    getPermiso: (state) => {
      return state.tipo_us;
    },
    getIsAdmin: (state) => {
      return state.tipo_us == PERMISOS.get("ADMIN");
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
  state: (): IUsuarios => ({
    usuarios: [],
    index: 0,
    indice: 0
  }),
  actions: {
    addUsuario(usuario: IUsuario) {
      this.usuarios.push(usuario);
    },
    setUsuario(usuario: IUsuario) {
      let usuarioIndex = this.usuarios.find(u => u.id == usuario.id);
      this.usuarios[usuarioIndex] = usuario;
    },
    eliminarUsiario(id: number) {
      this.usuarios = this.usuarios.filter(us => us.id !== id);
    },
    setIndice(indice: Number) {
      this.indice = indice;
    }
  },
  getters: {
    getUsuarios: (state) => {
      return state.usuarios;
    }
  },
  persist: true
});