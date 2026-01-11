import { useContext } from "react";
import { BoardContext } from "../context/BoardContext";

/**
 * Returns the properties of the board such as tile container width or tile count.
 */
export const useBoard = (): [number, number] => {
  const context = useContext(BoardContext);

  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider");
  }

  const { containerWidth, tileCount } = context;
  return [containerWidth, tileCount];
};


