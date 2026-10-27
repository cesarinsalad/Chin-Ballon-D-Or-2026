"use client";

type TrackOptions = {
  src: string;
  startTime: number;
  endTime: number;
  targetVolume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
};

export class CeremonyAudioLoop {
  private audio: HTMLAudioElement | null = null;
  private readonly options: Required<TrackOptions>;
  private monitorId: number | null = null;
  private fadeId: number | null = null;
  private isDesiredActive = false;
  private timeUpdateHandler: (() => void) | null = null;

  constructor(options: TrackOptions) {
    this.options = {
      src: options.src,
      startTime: options.startTime,
      endTime: options.endTime,
      targetVolume: options.targetVolume ?? 0.75,
      fadeInDuration: options.fadeInDuration ?? 1.5,
      fadeOutDuration: options.fadeOutDuration ?? 1.2,
    };
  }

  private getAudio(): HTMLAudioElement | null {
    if (typeof window === "undefined") return null;
    if (!this.audio) {
      this.audio = new Audio(this.options.src);
      this.audio.preload = "auto";
      this.audio.volume = 0;
      this.audio.currentTime = this.options.startTime;

      this.timeUpdateHandler = () => {
        if (!this.audio || !this.isDesiredActive) return;
        if (this.audio.currentTime >= this.options.endTime) {
          this.audio.currentTime = this.options.startTime;
        }
      };
      this.audio.addEventListener("timeupdate", this.timeUpdateHandler);
    }
    return this.audio;
  }

  start() {
    this.isDesiredActive = true;
    const audio = this.getAudio();
    if (!audio) return;

    this.clearFadeTimer();

    // If currentTime is outside [startTime, endTime], reset to startTime
    if (audio.currentTime < this.options.startTime || audio.currentTime >= this.options.endTime) {
      audio.currentTime = this.options.startTime;
    }

    const promise = audio.play();
    if (promise !== undefined) {
      promise.catch(() => {
        // Autoplay may be restricted until user interacts with the page
      });
    }

    this.runFade(this.options.targetVolume, this.options.fadeInDuration);
    this.startMonitor();
  }

  stop(immediate = false) {
    this.isDesiredActive = false;
    this.clearFadeTimer();

    const audio = this.audio;
    if (!audio) return;

    if (immediate) {
      this.stopMonitor();
      audio.pause();
      audio.volume = 0;
      audio.currentTime = this.options.startTime;
      return;
    }

    this.runFade(0, this.options.fadeOutDuration, () => {
      if (!this.isDesiredActive && this.audio) {
        this.stopMonitor();
        this.audio.pause();
        this.audio.currentTime = this.options.startTime;
      }
    });
  }

  private startMonitor() {
    if (this.monitorId !== null || typeof window === "undefined") return;
    this.monitorId = window.setInterval(() => {
      if (!this.audio || !this.isDesiredActive) return;
      if (this.audio.currentTime >= this.options.endTime) {
        this.audio.currentTime = this.options.startTime;
      }
    }, 35);
  }

  private stopMonitor() {
    if (this.monitorId !== null) {
      clearInterval(this.monitorId);
      this.monitorId = null;
    }
  }

  private runFade(targetVolume: number, durationSeconds: number, onComplete?: () => void) {
    const audio = this.audio;
    if (!audio || typeof window === "undefined") {
      onComplete?.();
      return;
    }

    const startVol = audio.volume;
    const diff = targetVolume - startVol;
    if (Math.abs(diff) < 0.01) {
      audio.volume = targetVolume;
      onComplete?.();
      return;
    }

    const stepMs = 30;
    const totalSteps = Math.max(Math.round((durationSeconds * 1000) / stepMs), 1);
    let stepCount = 0;

    this.fadeId = window.setInterval(() => {
      stepCount += 1;
      const progress = Math.min(stepCount / totalSteps, 1);
      // Smooth ease-out
      const factor = 1 - Math.pow(1 - progress, 2);
      const nextVol = Math.max(0, Math.min(1, startVol + diff * factor));
      audio.volume = nextVol;

      if (progress >= 1) {
        this.clearFadeTimer();
        audio.volume = targetVolume;
        onComplete?.();
      }
    }, stepMs);
  }

  private clearFadeTimer() {
    if (this.fadeId !== null) {
      clearInterval(this.fadeId);
      this.fadeId = null;
    }
  }

  destroy() {
    this.stop(true);
    if (this.audio) {
      if (this.timeUpdateHandler) {
        this.audio.removeEventListener("timeupdate", this.timeUpdateHandler);
        this.timeUpdateHandler = null;
      }
      this.audio.src = "";
      this.audio = null;
    }
  }
}
