export interface IVacunacion {
    id: number,
    fh_vacuna: string,
    vacuna_id: number,
    perro_id: number
}

export interface IPerro {
    id: number,
    nombre: string,
    raza: string,
    edad: number,
    usuario_id: number,
    fh_alta: string,
    evidencia: Array<byte> | null,
}
