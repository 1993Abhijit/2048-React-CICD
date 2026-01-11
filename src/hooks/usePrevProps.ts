import { useContext } from "react";
import { BoardContext } from "../context/BoardContext";

/**
 * Returns board-related values like container width and tile count
 */
export const useBoard = () => {
  const { containerWidth, tileCount } = useContext(BoardContext);

  return [containerWidth, tileCount] as [number, number];
};

