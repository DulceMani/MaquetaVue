import { defineStore } from "pinia";
import type { IPerro } from '@/interfaces/iperro'

interface IPerros {
  perros: Array<IPerro>,
  indice: number
}
export const usePerrosStore = defineStore("perros", {
  state:(): IPerros =>({
    perros: [],
    indice: 0,
  }),
  actions: {
    addPerro(perro: IPerro) {
      this.perros.push(perro)
    },
    setPerro(perro: IPerro) {
      let index = this.perros.findIndex(p => p.id == p.id);
      this.perros[index] = perro;
    },
    eliminaPerro(id: number) {
      this.perros = this.perros.filter(p => p.id !== id);
    }
  },
  getters:{
    getIndice: (state) => {
      return state.indice;
    }
  },
  persist: true
});