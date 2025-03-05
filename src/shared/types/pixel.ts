export interface Pixel {
  x: number;
  y: number;
  color: string;
}

export interface Grid {
  pixels: Pixel[];
  width: number;
  height: number;
}

export interface PixelUpdate {
  x: number;
  y: number;
  color: string;
}

export interface ServerStatus {
  status: "ok" | "error";
  timestamp: number;
}
