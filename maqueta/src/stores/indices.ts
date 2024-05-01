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
          i.indice+=1;
        }
      })
    },
    setIndice(clave: string, indice: number) {
      let index = this.indices.findIndex(i => i.clave == clave);
      this.indices[index].indice = indice;
    },
    async actualizaIndiceBD(clave: string) {
      let index = this.indices.findIndex(i => i.clave == clave);
      let resp = await axios({
        method: 'PATCH',
        url: `${API}/indices/${this.indices[index].id}`,
        data: { "indice": this.indices[index].indice }
      });
      this.indices[index] = resp.data;
    }
  },
  getters:{
    getIndice: (state) =>{
      return (clave) => state.indices.find(i => i.clave == clave)?.indice;
    }
  },
  persist: true
});