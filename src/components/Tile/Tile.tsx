import { useEffect, useState } from "react";
import invariant from "tiny-invariant";
import { usePrevProps } from "../../hooks/usePrevProps";
import { useBoard } from "../Board";
import "./tile.less";

type Props = {
  value: number;
  position: [number, number];
  zIndex: number;
};

export const Tile = ({ value, position, zIndex }: Props): JSX.Element => {
  const [containerWidth, tileCount]: [number, number] = useBoard();
  const [scale, setScale] = useState(1);
  const previousValue = usePrevProps<number>(value);

  const withinBoardBoundaries =
    position[0] < tileCount && position[1] < tileCount;
  invariant(withinBoardBoundaries, "Tile out of bound");

  const isNew = previousValue === undefined;
  const hasChanged = previousValue !== value;
  const shallHighlight = isNew || hasChanged;

  useEffect(() => {
    if (shallHighlight) {
      setScale(1.1);
      setTimeout(() => setScale(1), 100);
    }
  }, [shallHighlight, scale]);

  const positionToPixels = (position: number) => {
    return (position / tileCount) * containerWidth;
  };

  const style = {
    top: positionToPixels(position[1]),
    left: positionToPixels(position[0]),
    transform: `scale(${scale})`,
    zIndex,
  };

  return (
    <div className={`tile tile-${value}`} style={style}>
      {value}
    </div>
  );
};
