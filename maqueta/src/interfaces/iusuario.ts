export interface IUsuario {
  id: number,
  nombre: string,
  a_paterno: string,
  a_materno: string,
  correo: string,
  clave: string,
  foto: string | null,
  fh_alta: string | null,
}