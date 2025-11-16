import { Component, inject, model, ModelSignal, ElementRef, ViewChild } from '@angular/core';
import { ASSETS, dateFormater, getUser, onNextStep, parseAnswers } from '../../../Utils/Utils';
import { SectionComponent } from '../../items/section/section.component';
import { ChantierService } from '../../../services/chantier/chantier.service';
import { ToastrService } from 'ngx-toastr';
import { chantier, chantier_statut, chantier_step, nextStep, postControl, questions, user } from '../../../Utils/Types';
import { ActivatedRoute } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { ModalLayoutComponent } from '../../items/modals/modal-layout/modal-layout.component';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AddControlesComponent } from '../../items/modals/add-controles/add-controles.component';
import { AddControlesMicronComponent } from '../../items/modals/add-controles-micron/add-controles-micron.component';
import { AddSignatureComponent } from '../../items/modals/add-signature/add-signature.component';

@Component({
  selector: 'app-details-chantier',
  imports: [
    SectionComponent,
    ModalLayoutComponent,
    FormsModule,
    ReactiveFormsModule,
    AddControlesComponent,
    AddControlesMicronComponent,
    AddSignatureComponent,
  ],
  standalone: true,
  templateUrl: './details-chantier.component.html',
  styleUrl: './details-chantier.component.css'
})
export class DetailsChantierComponent {
  chantierService: ChantierService = inject(ChantierService);
  chantier: chantier | null = null;

  toaster: ToastrService = inject(ToastrService);
  route: ActivatedRoute = inject(ActivatedRoute);
  chantierId: string = "";

  user: user = getUser();

  // Active modals
  activeModalPhotoAvant: ModelSignal<boolean> = model<boolean>(false);
  activeModalControls: ModelSignal<boolean> = model<boolean>(false);
  activeModalSignature: ModelSignal<boolean> = model<boolean>(false);
  requestStatus: ModelSignal<boolean> = model<boolean>(false);
  // Fin active modals

  // Ajout de photos
  previewUrl: string | null = null;
  formGroup = new FormGroup({
    image: new FormControl<File | null>(null, [Validators.required]) // Typage explicite
  });
  file: File | null = null;
  private stream: MediaStream | null = null;

  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;

  constructor() {
    this.chantierId = this.route.snapshot.params["id"];
    this.getChantier();
  }

  toggleModalAddImageAvant() {
    this.activeModalPhotoAvant.set(true);
    this.startCamera();
  }

  async startCamera() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      this.videoElement.nativeElement.srcObject = this.stream;
      this.videoElement.nativeElement.play();
    } catch (error) {
      this.toaster.error('Impossible d\'accéder à la caméra. Vérifiez les permissions.');
      console.error('Erreur d\'accès à la caméra :', error);
    }
  }

  capturePhoto() {
    if (!this.stream) return;

    const video = this.videoElement.nativeElement;
    const canvas = this.canvasElement.nativeElement;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg');
    this.previewUrl = dataUrl;
    this.file = this.dataURLtoFile(dataUrl, `photo-${Date.now()}.jpg`);
    if (this.file) {
      this.formGroup.patchValue({ image: this.file });
    }

    this.stopCamera();
  }

  stopCamera() {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      this.videoElement.nativeElement.srcObject = null;
    }
  }

  dataURLtoFile(dataurl: string, filename: string): File {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  getChantier() {
    this.chantierService.getChantier(this.chantierId).subscribe(res => {
      console.log(res);
      this.chantier = res;
    });
  }

  controlRequestStatus(status: boolean) {
    if (status) {
      this.activeModalControls.set(false);
      this.activeModalSignature.set(false);
      this.updateStatus();
    }
  }

  onOpenModalControle() {
    this.activeModalControls.set(true);
  }

  onOpenModalSignature() {
    this.activeModalSignature.set(true);
  }

  updateStatus() {
    const nextStep: nextStep = onNextStep(this.chantier?.step);
    this.toaster.success("Mise à jour du statut de l'intervention");
    this.chantierService.updateStatus(nextStep.chantier_statut, nextStep.chantier_step, this.chantierId).subscribe(res => {
      console.log(res);
      this.toaster.success("Statut changé");
      this.requestStatus.set(false);
      this.getChantier();
    });
  }

  onAddPhotos(step: chantier_step) {
    if (!this.file) return;
    this.toaster.success('Enregistrement de la photo');
    this.chantierService.addPhoto({
      image: this.file,
      chantiers_model_id: this.chantierId,
      type_photo: step == "photos_avant" ? "avant" : "apres"
    }).subscribe(res => {
      this.toaster.success("Photo enregistrée");
      this.activeModalPhotoAvant.set(false);
      this.getChantier();
      this.file = null;
      this.previewUrl = null;
    });
  }

  onFileSelected(event: any) {
    this.file = event.target.files[0];
    this.previewUrl = URL.createObjectURL(event.target.files[0]);
  }

  protected readonly environment = environment;
  protected readonly dateFormater = dateFormater;
  protected readonly parseAnswers = parseAnswers;
}