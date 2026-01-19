/**
 * Entidad base para representar un gráfico educativo
 */
export class GraficoEducativo {
  constructor(
    public readonly tipoGrafico: string,
    public readonly elementos: any[],
    public readonly titulo?: string,
    public readonly descripcion?: string,
    public readonly opciones?: Record<string, any>
  ) {}

  /**
   * Valida que el gráfico tenga la estructura mínima requerida
   */
  public validar(): boolean {
    if (!this.tipoGrafico || this.tipoGrafico.trim() === '') {
      return false;
    }

    if (!Array.isArray(this.elementos) || this.elementos.length === 0) {
      return false;
    }

    return true;
  }

  /**
   * Verifica si el gráfico es de un tipo específico
   */
  public esTipo(tipo: string): boolean {
    return this.tipoGrafico === tipo;
  }
}

/**
 * Value Object para representar un elemento de gráfico
 */
export class ElementoGrafico {
  constructor(
    public readonly tipo: string,
    public readonly contenido: any,
    public readonly propiedades?: Record<string, any>
  ) {}
}
