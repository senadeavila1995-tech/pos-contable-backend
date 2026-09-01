import { env } from "../../config/env";
import { FacturaDIAN, RespuestaDIAN } from "./facturacion.types";

export class DianFacturacionProvider {

  /**
   * Punto único de integración con DIAN.
   *
   * TEST:
   * Simula la respuesta de DIAN sin realizar ninguna transmisión.
   *
   * DIAN:
   * Queda reservado para la integración real cuando existan
   * las credenciales, certificado digital y endpoints correspondientes.
   */
  static async enviarFactura(
    factura: FacturaDIAN,
    _xml?: string
  ): Promise<RespuestaDIAN> {

    const modo = env.FACTURACION_MODO.toLowerCase();

    // ============================================================
    // MODO PRUEBA
    // ============================================================

    if (modo === "test") {
      await new Promise(resolve => setTimeout(resolve, 300));

      return {
        numero: factura.factura.numero,
        cufe: `CUFE-TEST-${Date.now()}`,
        estado_dian: "PENDIENTE",
        mensaje: "Factura generada en modo de pruebas. No fue transmitida a DIAN.",
        codigo: "TEST"
      };
    }

    // ============================================================
    // MODO DIAN
    // ============================================================

    if (modo === "dian") {
      throw new Error(
        "La integración DIAN aún no está configurada. " +
        "Faltan credenciales, certificado digital y configuración del servicio."
      );
    }

    throw new Error(
      `FACTURACION_MODO inválido: "${env.FACTURACION_MODO}". ` +
      `Valores permitidos: test, dian.`
    );
  }
}
