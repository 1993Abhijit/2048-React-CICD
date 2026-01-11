import { useState, useCallback } from "react";
import { Tile } from "../../../Tile";

/**
 * Custom hook for managing the game state and tile movements.
 */
export const useGame = (): [
  Tile[],
  () => void, // moveLeft
  () => void, // moveRight
  () => void, // moveUp
  () => void  // moveDown
] => {
  const [tileList, setTileList] = useState<Tile[]>([]);

  const moveLeftHandler = useCallback(() => {
    // logic for moving tiles left
    setTileList((prev) => {
      // return updated tileList
      return prev; 
    });
  }, []);

  const moveRightHandler = useCallback(() => {
    // logic for moving tiles right
    setTileList((prev) => {
      return prev;
    });
  }, []);

  const moveUpHandler = useCallback(() => {
    // logic for moving tiles up
    setTileList((prev) => {
      return prev;
    });
  }, []);

  const moveDownHandler = useCallback(() => {
    // logic for moving tiles down
    setTileList((prev) => {
      return prev;
    });
  }, []);

  return [
    tileList,
    moveLeftHandler,
    moveRightHandler,
    moveUpHandler,
    moveDownHandler,
  ];
};



