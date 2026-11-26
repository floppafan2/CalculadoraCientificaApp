import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButtons,
  IonBackButton,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
} from '@ionic/angular';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import {
  HistorialService,
  OperacionHistorial,
} from '../../services/historial';

@Component({
  selector: 'app-historial',
  templateUrl: './historial.page.html',
  styleUrls: ['./historial.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButtons,
    IonBackButton,
    IonButton,
    IonIcon,
    IonList,
    IonItem,
    IonLabel,
  ],
})
export class HistorialPage implements OnInit {
  private historialService = inject(HistorialService);
  operaciones: OperacionHistorial[] = [];

  constructor() {
    addIcons({ trashOutline });
  }

  ngOnInit(): void {
    this.historialService.historial$.subscribe((lista) => {
      this.operaciones = lista;
    });
  }

  eliminar(id: number): void {
    this.historialService.eliminarOperacion(id);
  }

  limpiarTodo(): void {
    this.historialService.limpiarHistorial();
  }
}