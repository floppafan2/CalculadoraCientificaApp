import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CalculadoraService {
  // --- 1. OPERACIONES ARITMÉTICAS BÁSICAS ---

  sumar(a: number, b: number): number {
    return a + b;
  }

  restar(a: number, b: number): number {
    return a - b;
  }

  multiplicar(a: number, b: number): number {
    return a * b;
  }

  dividir(a: number, b: number): number {
    if (b === 0) {
      throw new Error('Error: División por cero');
    }
    return a / b;
  }

  porcentaje(a: number, b: number): number {
    return (a * b) / 100;
  }

  // --- 2. OPERACIONES CIENTÍFICAS ---

  raizCuadrada(n: number): number {
    if (n < 0) {
      throw new Error('Error: Raíz de número negativo');
    }
    return Math.sqrt(n);
  }

  potencia(base: number, exponente: number): number {
    return Math.pow(base, exponente);
  }

  logaritmoBase10(n: number): number {
    if (n <= 0) {
      throw new Error('Error: Logaritmo de número no positivo');
    }
    return Math.log10(n);
  }

  logaritmoNatural(n: number): number {
    if (n <= 0) {
      throw new Error('Error: Logaritmo de número no positivo');
    }
    return Math.log(n);
  }

  // Funciones trigonométricas (en grados para uso estándar de calculadora)
  private aRadianes(grados: number): number {
    return (grados * Math.PI) / 180;
  }

  private aGrados(radianes: number): number {
    return (radianes * 180) / Math.PI;
  }

  seno(grados: number): number {
    return Math.sin(this.aRadianes(grados));
  }

  coseno(grados: number): number {
    return Math.cos(this.aRadianes(grados));
  }

  tangente(grados: number): number {
    const rad = this.aRadianes(grados);
    if (Math.abs(Math.cos(rad)) < 1e-12) {
      throw new Error('Error: Tangente indefinida');
    }
    return Math.tan(rad);
  }

  // Funciones trigonométricas inversas (devuelven grados)
  arcoSeno(valor: number): number {
    if (valor < -1 || valor > 1) {
      throw new Error('Error: asin requiere valor entre -1 y 1');
    }
    return this.aGrados(Math.asin(valor));
  }

  arcoCoseno(valor: number): number {
    if (valor < -1 || valor > 1) {
      throw new Error('Error: acos requiere valor entre -1 y 1');
    }
    return this.aGrados(Math.acos(valor));
  }

  arcoTangente(valor: number): number {
    return this.aGrados(Math.atan(valor));
  }

  // --- 3. EVALUADOR DE EXPRESIONES CON JERARQUÍA DE OPERACIONES ---

  evaluarExpresion(expresion: string): number {
    const limpia = expresion.replace(/\s+/g, '');
    if (!limpia) {
      throw new Error('Error: Expresión vacía');
    }

    const tokens = this.tokenizar(limpia);
    let indice = 0;

    const verActual = (): string | undefined => tokens[indice];
    const consumir = (): string => tokens[indice++];

    const parsearSumaResta = (): number => {
      let izquierda = parsearMultDiv();
      while (verActual() === '+' || verActual() === '-') {
        const op = consumir();
        const derecha = parsearMultDiv();
        izquierda =
          op === '+'
            ? this.sumar(izquierda, derecha)
            : this.restar(izquierda, derecha);
      }
      return izquierda;
    };

    const parsearMultDiv = (): number => {
      let izquierda = parsearPotencia();
      while (verActual() === '*' || verActual() === '/' || verActual() === '%') {
        const op = consumir();
        const derecha = parsearPotencia();
        if (op === '*') izquierda = this.multiplicar(izquierda, derecha);
        else if (op === '/') izquierda = this.dividir(izquierda, derecha);
        else izquierda = this.porcentaje(izquierda, derecha);
      }
      return izquierda;
    };

    const parsearPotencia = (): number => {
      const base = parsearUnario();
      if (verActual() === '^') {
        consumir();
        const exponente = parsearPotencia();
        return this.potencia(base, exponente);
      }
      return base;
    };

    const parsearUnario = (): number => {
      if (verActual() === '+') {
        consumir();
        return parsearUnario();
      }
      if (verActual() === '-') {
        consumir();
        return -parsearUnario();
      }
      return parsearPrimario();
    };

    const parsearPrimario = (): number => {
      const token = verActual();
      if (!token) {
        throw new Error('Error: Expresión incompleta');
      }

      // Número
      if (/^\d+(\.\d+)?$/.test(token)) {
        consumir();
        return parseFloat(token);
      }

      // Paréntesis
      if (token === '(') {
        consumir();
        const valor = parsearSumaResta();
        if (verActual() !== ')') {
          throw new Error('Error: Falta paréntesis de cierre');
        }
        consumir();
        return valor;
      }

      // Funciones científicas
      const funciones = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', '√'];
      if (funciones.includes(token)) {
        consumir();
        if (verActual() !== '(') {
          throw new Error(`Error: Sintaxis inválida en ${token}`);
        }
        consumir();
        const arg = parsearSumaResta();
        if (verActual() !== ')') {
          throw new Error('Error: Falta paréntesis de cierre');
        }
        consumir();
        return this.ejecutarFuncion(token, arg);
      }

      throw new Error('Error: Operación inválida');
    };

    const resultado = parsearSumaResta();

    if (indice < tokens.length) {
      throw new Error('Error: Expresión inválida');
    }

    if (!isFinite(resultado) || isNaN(resultado)) {
      throw new Error('Error: Resultado no definido');
    }

    // Redondeo suave para evitar imprecisiones de punto flotante (ej. 0.1 + 0.2)
    return parseFloat(resultado.toPrecision(12));
  }

  private ejecutarFuncion(nombre: string, valor: number): number {
    switch (nombre) {
      case 'sin': return this.seno(valor);
      case 'cos': return this.coseno(valor);
      case 'tan': return this.tangente(valor);
      case 'asin': return this.arcoSeno(valor);
      case 'acos': return this.arcoCoseno(valor);
      case 'atan': return this.arcoTangente(valor);
      case 'log': return this.logaritmoBase10(valor);
      case 'ln': return this.logaritmoNatural(valor);
      case '√': return this.raizCuadrada(valor);
      default: throw new Error(`Error: Función desconocida ${nombre}`);
    }
  }

  private tokenizar(expresion: string): string[] {
    const regex = /(\d+(?:\.\d+)?|asin|acos|atan|sin|cos|tan|log|ln|√|[+\-*/%^()])/g;
    const tokens = expresion.match(regex);
    if (!tokens || tokens.join('') !== expresion) {
      throw new Error('Error: Caracteres inválidos');
    }
    return tokens;
  }
}