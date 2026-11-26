import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface OperacionHistorial {
  id: number;
  expresion: string;
  resultado: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root',
})
export class HistorialService {
  private readonly STORAGE_KEY = 'calculadora_historial';
  private historialSubject = new BehaviorSubject<OperacionHistorial[]>(
    this.cargarDesdeStorage()
  );

  historial$ = this.historialSubject.asObservable();

  private cargarDesdeStorage(): OperacionHistorial[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  private guardarEnStorage(lista: OperacionHistorial[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lista));
    this.historialSubject.next(lista);
  }

  agregarOperacion(expresion: string, resultado: string): void {
    const nueva: OperacionHistorial = {
      id: Date.now(),
      expresion,
      resultado,
      fecha: new Date().toLocaleString(),
    };
    const actual = [nueva, ...this.historialSubject.value];
    this.guardarEnStorage(actual);
  }

  eliminarOperacion(id: number): void {
    const filtrado = this.historialSubject.value.filter((op) => op.id !== id);
    this.guardarEnStorage(filtrado);
  }

  limpiarHistorial(): void {
    this.guardarEnStorage([]);
  }
}