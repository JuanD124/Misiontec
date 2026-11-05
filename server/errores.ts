export class ErrorNegocio extends Error {
  constructor(public estado: number, mensaje: string) {
    super(mensaje);
  }
}
