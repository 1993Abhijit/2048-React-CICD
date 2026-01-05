import { useBoard } from "../Board";

import "./grid.less";

export const Grid = (): JSX.Element => {
  const [, tileCount]: [number, number] = useBoard();

  const renderGrid = () => {
    const length = tileCount * tileCount;
    const cells: JSX.Element[] = [];

    for (let index = 0; index < length; index += 1) {
      cells.push(<div key={`${index}`} className="grid-cell" />);
    }

    return cells;
  };

  return <div className="grid">{renderGrid()}</div>;
};
