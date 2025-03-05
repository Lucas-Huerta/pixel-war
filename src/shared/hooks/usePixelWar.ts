import { useState, useEffect } from "react";
import { Grid, PixelUpdate } from "@/shared/types/pixel";
import { socketService } from "@/shared/api/socketService";
import { gridService } from "@/shared/api/gridService";

export const usePixelWar = () => {
  const [grid, setGrid] = useState<Grid | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initial grid load
    gridService.getCurrentGrid().then(setGrid).catch(console.error);

    // Socket connections
    socketService.onConnect(() => setIsConnected(true));
    socketService.onDisconnect(() => setIsConnected(false));

    socketService.onPixelUpdate((pixel: PixelUpdate) => {
      setGrid((currentGrid) => {
        if (!currentGrid) return currentGrid;
        const newPixels = [...currentGrid.pixels];
        const index = newPixels.findIndex(
          (p) => p.x === pixel.x && p.y === pixel.y,
        );
        if (index !== -1) {
          newPixels[index] = pixel;
        } else {
          newPixels.push(pixel);
        }
        return { ...currentGrid, pixels: newPixels };
      });
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  const updatePixel = (pixel: PixelUpdate) => {
    socketService.updatePixel(pixel);
  };

  const refreshGrid = async () => {
    const newGrid = await gridService.getCurrentGrid();
    setGrid(newGrid);
  };

  return {
    grid,
    isConnected,
    updatePixel,
    refreshGrid,
  };
};
