import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { CommonModule, formatDate } from '@angular/common';
import { FormControl, FormsModule, NgForm } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import * as CryptoJS from 'crypto-js';
import { ActivatedRoute } from '@angular/router';
import { LanguageService } from '../services/language.service';
import { LanguageComponent } from '../language/language.component';
import { MaterialModule } from '../material.module';
import { SurveyService } from '../services/surveyService.service';
import { S } from '@angular/cdk/scrolling-module.d-ud2XrbF8';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    LanguageComponent,
    TranslateModule,
  ],
  selector: 'app-checker-component',
  templateUrl: './checker-component.component.html',
  styleUrls: ['./checker-component.component.scss'],
})
export class CheckerComponentComponent implements AfterViewInit, OnInit {
  constructor(
    private langService: LanguageService,
    private route: ActivatedRoute,
    private surveyService: SurveyService
  ) {}

  dir: 'ltr' | 'rtl' = 'ltr';
  name: string = '';
  age: number | null = 35;
  ages: number[] = Array.from({ length: 120 }, (_, i) => i + 1);
  gender: 'male' | 'female' | null = null;
  step: number = 1;
  conditions: { id: string; label: string; checked: boolean }[] = [
    {
      id: 'none',
      label: 'I do not have any of the following conditions',
      checked: false,
    },
    {
      id: 'pregnant',
      label: 'Currently pregnant or breastfeeding',
      checked: false,
    },
    { id: 'cancer', label: 'Undergoing cancer treatment', checked: false },
    { id: 'gallbladder', label: 'Gallbladder disease', checked: false },
    { id: 'type1', label: 'Type 1 diabetes', checked: false },
    { id: 'type2', label: 'Type 2 diabetes', checked: false },
    {
      id: 'ibd',
      label:
        "Inflammatory bowel disease (IBD), including Crohn's disease and ulcerative colitis",
      checked: false,
    },
  ];
  symptoms: { id: string; label: string; checked: boolean }[] = [
    {
      id: 'none_sym',
      label: 'I do not have any of the following conditions',
      checked: false,
    },
    { id: 'heartburn', label: 'Heartburn (Acidity)', checked: false },
    { id: 'hpylori', label: 'H. pylori infection', checked: false },
    { id: 'acid_reflux', label: 'Acid reflux', checked: false },
    { id: 'diarrhea', label: 'Diarrhea or constipation', checked: false },
    {
      id: 'prev_gallbladder',
      label: 'Previous gallbladder removal surgery',
      checked: false,
    },
  ];
  selectedConditions: any[];
  selectedSymptoms: any[];

  // Height
  height: number = 170;
  minHeight = 100;
  maxHeight = 220;
  pxPerCm = 14;
  @ViewChild('rulerWrappers', { static: false })
  rulerWrapper?: ElementRef<HTMLElement>;
  wrapperHeight = 0;
  wrapperCenter = 0;
  translateY = 0;
  isDragging = false;
  startY = 0;
  startTranslate = 0;
  ticks: number[] = [];
  //  Weight
  weight = 79;
  minWeight = 30;
  maxWeight = 220;
  arcRadius = 220;
  paddingX = 10;
  paddingY = 50;
  arcAngle = 180;
  arcCenterX: number = 220;
  arcCenterY: number = 250;
  viewBoxWidth!: number;
  viewBoxHeight!: number;
  totalSteps!: number;
  stepAngle!: number;
  baseAngle!: number;
  offsetAngle = 0;
  isDraggingWeight = false;
  startX = 0;
  startOffset = 0;
  degPerPx = 0.35;
  isSnapping = false;
  bmi: number = 0;
  heightCm = 170;
  bmiStatus: 'low' | 'normal' | 'high' = 'normal';

  phoneNumber: string = '';
  termsAccepted: boolean = false;
  showError: boolean = false;
  selectedPayment: string = '';
  paymentMethods: any;
  currentPatient: any;
  finalData: any;
  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      const data = params.get('e');
      if (data) {
        const decoded = this.decryptData(data);
        this.currentPatient = decoded;
        console.log('path param data:', decoded);
        this.name = decoded.FirstName + ' ' + decoded.LastName || '';
        this.age = Number(decoded.Age);
        this.gender = decoded.Gender === 2 ? 'female' : 'male';
        this.phoneNumber = decoded.MobileNumber || '';
        this.height = Number(decoded.HeightCm) || 170;
        // this.heightCm = this.height;
        this.weight = Number(decoded.WeightKg) || 79;
        // this.loadPaymentMethods();
      }
    });
    this.langService.currentDirection$.subscribe((dir) => {
      this.dir = dir;
    });
    this.ticks = Array.from(
      { length: this.maxHeight - this.minHeight + 1 },
      (_, i) => this.minHeight + i
    );
  }
  decryptData(token: string): any {
    const key = CryptoJS.enc.Utf8.parse('12345678901234567890123456789012');
    const iv = CryptoJS.enc.Utf8.parse('1234567890123456');
    const decrypted = CryptoJS.AES.decrypt(decodeURIComponent(token), key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);
    return JSON.parse(plaintext);
  }
  ngAfterViewInit(): void {}

  ngAfterViewChecked(): void {
    if (
      this.step === 4 &&
      this.rulerWrapper &&
      this.rulerWrapper.nativeElement &&
      this.wrapperHeight === 0
    ) {
      setTimeout(() => {
        this.wrapperHeight = this.rulerWrapper!.nativeElement.clientHeight;
        this.wrapperCenter = this.wrapperHeight / 2;
        this.updateTranslateFromHeight();
      }, 0);
    }
  }
  polarToCartesian(radius: number, angleDeg: number) {
    const rad = ((angleDeg || 0) * Math.PI) / 180;
    return {
      x: this.arcCenterX + radius * Math.cos(rad),
      y: this.arcCenterY + radius * Math.sin(rad),
    };
  }
  get weightTicksArc() {
    const ticks: {
      angle: number;
      value: number;
      type: 'big' | 'medium' | 'small';
    }[] = [];
    for (let i = 0; i <= this.totalSteps; i++) {
      const value = this.minWeight + i;
      const angle = this.baseAngle + i * this.stepAngle;
      let type: 'big' | 'medium' | 'small' = 'small';
      if (value % 10 === 0) type = 'big';
      else if (value % 5 === 0) type = 'medium';
      ticks.push({ angle, value, type });
    }
    return ticks;
  }
  get weightUnderPointer(): number {
    // index = (arcAngle/2 - offsetAngle) / stepAngle
    const idxFloat = (this.arcAngle / 2 - this.offsetAngle) / this.stepAngle;
    const idx = Math.round(idxFloat);
    const clampedIdx = Math.max(0, Math.min(this.totalSteps, idx));
    return this.minWeight + clampedIdx;
  }
  setOffsetForWeight(w: number) {
    const idx = Math.max(
      0,
      Math.min(this.totalSteps, Math.round(w - this.minWeight))
    );
    const newOffset = this.arcAngle / 2 - idx * this.stepAngle;
    this.offsetAngle = this.clampOffset(newOffset);
    this.calculateBMI();
  }
  clampOffset(val: number) {
    const half = this.arcAngle / 2;
    return Math.max(-half, Math.min(half, val));
  }
  onWeightPointerDown(ev: PointerEvent) {
    ev.preventDefault();
    this.isDraggingWeight = true;
    this.isSnapping = false;
    this.startX = ev.clientX;
    this.startOffset = this.offsetAngle;
    try {
      // capture on the element that has the handler to avoid capturing an inner SVG child
      const el = ev.currentTarget as Element;
      el.setPointerCapture(ev.pointerId);
      // add a class for styling (cursor)
      try {
        (el as HTMLElement).classList.add('dragging');
      } catch {}
    } catch {}
  }
  onWeightPointerMove(ev: PointerEvent) {
    if (!this.isDraggingWeight) return;
    const delta = ev.clientX - this.startX;
    const candidate = this.startOffset + delta * this.degPerPx;
    this.offsetAngle = this.clampOffset(candidate);
    // update displayed live weight
    this.weight = this.weightUnderPointer;
    this.calculateBMI();
  }
  onWeightPointerUp(ev: PointerEvent) {
    if (!this.isDraggingWeight) return;
    this.isDraggingWeight = false;
    try {
      const el = ev.currentTarget as Element;
      try {
        (el as HTMLElement).classList.remove('dragging');
      } catch {}
      el.releasePointerCapture(ev.pointerId);
    } catch {}
    // snap to nearest integer value
    const idxFloat = (this.arcAngle / 2 - this.offsetAngle) / this.stepAngle;
    const snappedIdx = Math.max(
      0,
      Math.min(this.totalSteps, Math.round(idxFloat))
    );
    const snappedWeight = this.minWeight + snappedIdx;

    this.isSnapping = true;
    const snappedOffset = this.arcAngle / 2 - snappedIdx * this.stepAngle;
    this.offsetAngle = snappedOffset;
    this.weight = snappedWeight;
    this.calculateBMI();
    setTimeout(() => {
      this.isSnapping = false;
    }, 220);
  }
  get arcStartPoint() {
    return this.polarToCartesian(this.arcRadius, -90 - this.arcAngle / 2);
  }
  get arcEndPoint() {
    return this.polarToCartesian(this.arcRadius, -90 + this.arcAngle / 2);
  }
  onInputChangeWeight(e: Event) {
    const v = Number((e.target as HTMLInputElement).value);
    if (!isNaN(v)) this.setWeight(v);
  }
  setWeight(newW: number) {
    const clamped = Math.max(
      this.minWeight,
      Math.min(this.maxWeight, Math.round(newW))
    );
    this.weight = clamped;
    this.setOffsetForWeight(clamped);
  }
  loadWeightArc() {
    this.arcCenterX = this.arcRadius + this.paddingX;
    this.arcCenterY = this.arcRadius + 8;
    this.viewBoxWidth = Math.round(this.arcCenterX * 2);
    this.viewBoxHeight = Math.round(this.arcCenterY + this.paddingY);
    this.totalSteps = this.maxWeight - this.minWeight;
    this.stepAngle = this.arcAngle / this.totalSteps;
    this.baseAngle = -90 - this.arcAngle / 2;
    this.setOffsetForWeight(this.weight);
  }
  onWheelWeight(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY > 0) {
      this.setWeight(this.weight + 1);
    } else if (event.deltaY < 0) {
      this.setWeight(this.weight - 1);
    }
  }
  selectGender(g: 'male' | 'female') {
    this.gender = g;
  }
  toggleCondition(id: string) {
    const item = this.conditions.find((c) => c.id === id);
    if (!item) return;
    item.checked = !item.checked;

    if (id === 'none' && item.checked) {
      this.conditions.forEach((c) => {
        if (c.id !== 'none') c.checked = false;
      });
    } else if (id !== 'none' && item.checked) {
      const none = this.conditions.find((c) => c.id === 'none');
      if (none) none.checked = false;
    }
    this.selectedConditions = this.conditions.filter((c) => c.checked);
  }
  toggleSymptom(id: string) {
    const item = this.symptoms.find((s) => s.id === id);
    if (!item) return;
    item.checked = !item.checked;

    if (id === 'none_sym' && item.checked) {
      this.symptoms.forEach((s) => {
        if (s.id !== 'none_sym') s.checked = false;
      });
    } else if (id !== 'none_sym' && item.checked) {
      const none = this.symptoms.find((s) => s.id === 'none_sym');
      if (none) none.checked = false;
    }
    this.selectedSymptoms = this.symptoms.filter((c) => c.checked);
  }
  goNext() {
    if (this.step === 1) {
      // validate step1
      if (!this.name || !this.age || this.age <= 7 || !this.gender) return;

      this.step++;
    } else if (this.step === 2) {
      this.step++;
    } else if (this.step === 3) {
      this.step++;
    } else if (this.step === 4) {
      this.loadWeightArc();

      this.step++;
    } else if (this.step === 5) {
      this.step++;
    } else if (this.step === 6) {
      if (!this.termsAccepted) {
        this.showError = true;
        return;
      }
      if (!this.phoneNumber || this.phoneNumber.length < 5) {
        this.showError = true;
        return;
      }
      this.loadPaymentMethods();
      this.showError = false;
      this.step++;
    }
  }
  goBack() {
    if (this.step > 1) this.step -= 1;
  }
  updateTranslateFromHeight() {
    const index = this.height - this.minHeight;
    this.translateY =
      this.wrapperCenter - (index * this.pxPerCm + this.pxPerCm / 2);
  }
  translateToHeight(translate: number) {
    const i =
      (this.wrapperCenter - this.pxPerCm / 2 - translate) / this.pxPerCm;
    const h = Math.round(i) + this.minHeight;
    return Math.max(this.minHeight, Math.min(this.maxHeight, h));
  }
  setHeight(newH: number) {
    const clamped = Math.max(
      this.minHeight,
      Math.min(this.maxHeight, Math.round(newH))
    );
    this.height = clamped;
    this.updateTranslateFromHeight();
  }
  onWheel(event: WheelEvent) {
    event.preventDefault();
    if (event.deltaY > 0) {
      this.setHeight(this.height + 1);
    } else if (event.deltaY < 0) {
      this.setHeight(this.height - 1);
    }
  }
  onPointerDown(event: PointerEvent) {
    if (event.button !== 0) return;
    this.isDragging = true;
    this.startY = event.clientY;
    this.startTranslate = this.translateY;
    try {
      if (this.rulerWrapper && this.rulerWrapper.nativeElement) {
        this.rulerWrapper.nativeElement.setPointerCapture(event.pointerId);
      } else {
        return;
      }
    } catch {}
    if (this.rulerWrapper && this.rulerWrapper.nativeElement) {
      this.rulerWrapper.nativeElement.classList.add('dragging');
    }
  }
  onPointerMove(event: PointerEvent) {
    if (!this.isDragging) return;

    const delta = event.clientY - this.startY;
    this.translateY = this.startTranslate + delta;
  }
  onPointerUp(event: PointerEvent) {
    if (!this.isDragging) return;
    this.isDragging = false;

    try {
      if (this.rulerWrapper && this.rulerWrapper.nativeElement) {
        this.rulerWrapper.nativeElement.releasePointerCapture(event.pointerId);
      }
    } catch {}
    if (this.rulerWrapper && this.rulerWrapper.nativeElement) {
      this.rulerWrapper.nativeElement.classList.remove('dragging');
    }

    const snappedHeight = this.translateToHeight(this.translateY);
    this.setHeight(snappedHeight);
  }
  onInputChange(e: Event) {
    const v = Number((e.target as HTMLInputElement).value);
    if (!isNaN(v)) this.setHeight(v);
  }
  calculateBMI() {
    const hM = this.heightCm / 100;
    this.bmi = +(this.weight / (hM * hM)).toFixed(1);

    if (this.bmi < 27) this.bmiStatus = 'low';
    else if (this.bmi < 30) this.bmiStatus = 'normal';
    else this.bmiStatus = 'high';
  }
  get bmiArcPath() {
    const startX = 20,
      startY = 100;
    const r = 80;
    const angle = Math.min(this.bmi / 40, 1) * 180; // BMI max ~40
    const rad = (Math.PI * angle) / 180;
    const endX = 100 + r * Math.cos(Math.PI - rad);
    const endY = 100 - r * Math.sin(Math.PI - rad);

    const largeArc = angle > 180 ? 1 : 0;
    return `M ${startX} ${startY} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`;
  }
  loadPaymentMethods() {
    this.surveyService
      .loadPayementMethods(this.currentPatient.surveyId)
      .subscribe((data) => {
        this.paymentMethods = data;
        console.log(this.paymentMethods, 'paymentMethods');
        console.log(this.currentPatient.SurveyRefrenceId, 'SurveyRefrenceId');
      });
  }
  selectPayment(method: string) {
    this.selectedPayment = method;
    this.saveData();
  }
  saveData() {
    const Data = {
      patientId: this.currentPatient.PatientID,
      name: this.name,
      age: 25,
      gender: this.gender,
      conditions: this.selectedConditions,
      symptoms: this.selectedSymptoms,
      height: this.height,
      weight: this.weight,
      phoneNumber: this.phoneNumber,
      paymentMethod: this.selectedPayment,
      SurveyRefrenceId: this.currentPatient.SurveyRefrenceId,
    };
    // const form = new FormData();
    // form.append('SurveyRefrenceId', this.currentPatient.SurveyRefrenceId);
    // form.append('JsonData', JSON.stringify(Data));

    this.surveyService.postRedirect(
      'https://epharmacy.hmg.com/leanscale_uat/survey/save_survey',
      Data
    );
    // this.surveyService.saveSurvey(form).subscribe((data) => {
    //   console.log(data);
    // });
  }
}
