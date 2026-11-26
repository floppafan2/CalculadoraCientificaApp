import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonLabel,
  IonInput,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { timeOutline } from 'ionicons/icons';
import { CalculadoraService } from '../services/calculadora';
import { HistorialService } from '../services/historial';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [
    RouterLink,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonButton,
    IonIcon,
    IonGrid,
    IonRow,
    IonCol,
    IonLabel,
    IonInput,
  ],
})
export class HomePage {
  private calculadoraService = inject(CalculadoraService);
  private historialService = inject(HistorialService);

  expresion: string = '';
  resultado: string = '0';
  mensajeError: string = '';

  constructor() {
    addIcons({ timeOutline });
  }

  presionar(valor: string): void {
    this.mensajeError = '';

    // Evita operadores binarios duplicados consecutivos (ej. "++", "**")
    const operadores = ['+', '-', '*', '/', '%', '^'];
    const ultimo = this.expresion.slice(-1);
    if (operadores.includes(valor) && operadores.includes(ultimo)) {
      this.expresion = this.expresion.slice(0, -1) + valor;
      return;
    }

    this.expresion += valor;
  }

  borrarUltimo(): void {
    this.mensajeError = '';
    this.expresion = this.expresion.slice(0, -1);
  }

  limpiar(): void {
    this.expresion = '';
    this.resultado = '0';
    this.mensajeError = '';
  }

  calcular(): void {
    if (!this.expresion.trim()) return;

    try {
      const valor = this.calculadoraService.evaluarExpresion(this.expresion);
      this.resultado = valor.toString();
      this.mensajeError = '';

      // Guarda la operación en el historial
      this.historialService.agregarOperacion(this.expresion, this.resultado);
    } catch (error: any) {
      this.resultado = 'Error';
      this.mensajeError = error?.message || 'Error en la operación';
    }
  }
}