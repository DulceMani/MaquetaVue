import type { IIndice } from "@/interfaces/iindice";
import { defineStore } from "pinia";
import axios from 'axios'
import { API } from "@/contantes";

interface IIndices {
  indices: Array<IIndice>
}

export const useIndicesStore = defineStore("indices", {
  state: (): IIndices => ({
    indices: []
  }),
  actions: {
    estableceIndices(indices: Array<IIndice>) {
      this.indices = indices;
    },
    incrementaIndice(clave: String) {
      this.indices.map(i => {
        if (i.clave == clave) {
          i.indice++;
        }
      })
    },
    setIndice(clave: string, indice: number) {
      this.indices.map(i => {
        if (i.clave == clave)
          i.indice = indice;
      })
    },
    async actualizaIndiceBD(clave: string) {
      let indice = this.indices.find(i => i.clave == clave);
      let resp = await axios({
        method: 'PATCH',
        url: `${API}/indices/${indice.id}`,
        data: { "indice": indice?.indice }
      });
      this.indices = resp.data;
    }
  },
  getters: {
    getIndice: (state) => {
      return (clave) => state.indices.find(i => i.clave == clave)?.indice;
    },
    getId: (state) => {
      return (clave) => state.indices.find(i => i.clave == clave)?.id;
    }
  },
  persist: true
});