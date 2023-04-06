import { Component, OnInit, Output, EventEmitter, Input, OnChanges, OnDestroy, AfterViewInit, HostListener } from '@angular/core';
import { ViewerService } from '../services/viewer-service/viewer-service';
import { eventName, TelemetryType } from '../telemetry-constants';


@Component({
  selector: 'quml-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {

  @Input() questions?: any;
  @Input() duration?: any;
  @Input() warningTime?: string;
  @Input() disablePreviousNavigation: boolean;
  @Input() showTimer: boolean;
  @Input() totalNoOfQuestions: number;
  @Input() currentSlideIndex: number;
  @Input() active: boolean;
  @Input() initializeTimer: boolean;
  @Input() endPageReached: boolean;
  @Input() loadScoreBoard: boolean;
  @Input() replayed: boolean;
  @Input() currentSolutions: any;
  @Input() showFeedBack: boolean;
  @Input() disableNext?: boolean;
  @Input() startPageInstruction?: string;
  @Input() showStartPage?: boolean;
  @Input() attempts?: { max: number, current: number };
  @Input() showDeviceOrientation: boolean = false;
  @Input() showLegend: boolean;
  @Input() navigationType?: any
  
  @Output() nextSlideClicked = new EventEmitter<any>();
  @Output() prevSlideClicked = new EventEmitter<any>();
  @Output() durationEnds = new EventEmitter<any>();
  @Output() showSolution = new EventEmitter<any>();
  @Output() toggleScreenRotate = new EventEmitter<any>();


  minutes: number;
  seconds: string | number;
  private intervalRef?;
  showWarning = false;
  isMobilePortrait = false;
  time: any;
  showProgressIndicatorPopUp = false;
  constructor(private viewerService: ViewerService) {
  }


  ngOnInit() {
    if (this.duration && this.showTimer) {
      this.minutes = Math.floor(this.duration / 60);
      this.seconds = this.duration - this.minutes * 60 < 10 ? `0${this.duration - this.minutes * 60}` : this.duration - this.minutes * 60;
    }
  }

  ngOnChanges() {
    if (this.duration && this.showTimer && this.initializeTimer && !this.intervalRef) {
      this.timer();
    } else if (this.duration === 0 && this.showTimer && this.initializeTimer && !this.intervalRef) {
      this.showCountUp();
    }
    if (this.replayed && this.duration && this.showTimer) {
      this.showWarning = false;
      clearInterval(this.intervalRef)
      this.timer();
    } else if (this.replayed && this.duration === 0 && this.showTimer) {
      clearInterval(this.intervalRef)
      this.showCountUp();
    }
  }

  ngAfterViewInit() {
    this.isMobilePortrait = window.matchMedia("(max-width: 480px)").matches;
  }

  ngOnDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  nextSlide() {
    if (!this.disableNext) {
      this.nextSlideClicked.emit({ type: 'next' });
    }
  }

  prevSlide() {
    if (!this.showStartPage && this.currentSlideIndex === 1) {
      return
    }
    if (!this.disablePreviousNavigation) {
      this.prevSlideClicked.emit({ event: 'previous clicked' });
    }
  }

  timer() {
    /* istanbul ignore else */
    if (this.duration > 0) {
      let durationInSec = this.duration;
      this.intervalRef = setInterval(() => {
        let min = ~~(durationInSec / 60);
        let sec = (durationInSec % 60);
        if (sec < 10) {
          this.time = min + ':' + '0' + sec;
        } else {
          this.time = min + ':' + sec;
        }
        if (durationInSec === 0) {
          clearInterval(this.intervalRef);
          this.durationEnds.emit(true);
          return false;
        }
        /* istanbul ignore else */
        if (parseInt(durationInSec) <= parseInt(this.warningTime)) {
          this.showWarning = true;
        }
        durationInSec--;
      }, 1000);
    }
  }

  showCountUp() {
    let min = 0;
    let sec = 0;
    this.intervalRef = setInterval(() => {
      if (sec === 59) {
        sec = 0;
        min = min + 1;
      }
      if (sec < 10) {
        this.time = min + ':' + '0' + sec++;
      } else {
        this.time = min + ':' + sec++;
      }
    }, 1000);
  }

  onAnswerKeyDown(event: KeyboardEvent) {
    /* istanbul ignore else */
    if (event.key === 'Enter') {
      event.stopPropagation();
      this.showSolution.emit()
    }
  }

  openProgressIndicatorPopup() {
    this.showProgressIndicatorPopUp = true;
    this.viewerService.raiseHeartBeatEvent(eventName.progressIndicatorPopupOpened, TelemetryType.interact, this.currentSlideIndex);
  }

  @HostListener('document:keydown.escape', ['$event']) onKeydownHandler(event: KeyboardEvent) {
    this.onProgressPopupClose();
  }

  onProgressPopupClose() {
    this.showProgressIndicatorPopUp = false;
    this.viewerService.raiseHeartBeatEvent(eventName.progressIndicatorPopupClosed, TelemetryType.interact, this.currentSlideIndex);
  }
}
