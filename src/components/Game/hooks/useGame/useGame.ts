import { useCallback, useEffect, useReducer, useRef } from "react";
import {
  animationDuration,
  tileCount as tileCountPerRowOrColumn,
} from "../../../Board";
import { TileMeta } from "../../../Tile";
import { useIds } from "../useIds";
import { GameReducer, initialState } from "./reducer";

export const useGame = () => {
  const isInitialRender = useRef(true);
  const [nextId] = useIds();

  // state
  const [state, dispatch] = useReducer(GameReducer, initialState);
  const { tiles, byIds, hasChanged, inMotion } = state;

  // --- Core tile operations ---

  const createTile = useCallback(
    ({ position, value }: Partial<TileMeta>) => {
      if (!position || value === undefined) return;

      const tile: TileMeta = {
        id: nextId(),
        position,
        value,
      };

      dispatch({ type: "CREATE_TILE", tile });
    },
    [nextId]
  );

  const updateTile = (tile: TileMeta) => {
    dispatch({ type: "UPDATE_TILE", tile });
  };

  const mergeTile = (source: TileMeta, destination: TileMeta) => {
    dispatch({ type: "MERGE_TILE", source, destination });
  };

  const throttledMergeTile = (source: TileMeta, destination: TileMeta) => {
    setTimeout(() => mergeTile(source, destination), animationDuration);
  };

  const didTileMove = (source: TileMeta, destination: TileMeta) => {
    return (
      source.position[0] !== destination.position[0] ||
      source.position[1] !== destination.position[1]
    );
  };

  // --- Board helpers ---

  const positionToIndex = (position: [number, number]) =>
    position[1] * tileCountPerRowOrColumn + position[0];

  const indexToPosition = (index: number): [number, number] => {
    const x = index % tileCountPerRowOrColumn;
    const y = Math.floor(index / tileCountPerRowOrColumn);
    return [x, y];
  };

  const retrieveTileMap = useCallback(() => {
    const tileMap = new Array(tileCountPerRowOrColumn ** 2).fill(0);
    byIds.forEach((id) => {
      const { position } = tiles[id];
      tileMap[positionToIndex(position)] = id;
    });
    return tileMap;
  }, [byIds, tiles]);

  const findEmptyTiles = useCallback(() => {
    const tileMap = retrieveTileMap();
    return tileMap.reduce<[number, number][]>((result, tileId, index) => {
      if (tileId === 0) result.push(indexToPosition(index));
      return result;
    }, []);
  }, [retrieveTileMap]);

  const generateRandomTile = useCallback(() => {
    const emptyTiles = findEmptyTiles();
    if (!emptyTiles.length) return;

    const index = Math.floor(Math.random() * emptyTiles.length);
    createTile({ position: emptyTiles[index], value: 2 });
  }, [findEmptyTiles, createTile]);

  // --- Move logic ---

  type RetrieveTileIdsPerRowOrColumn = (rowOrColumnIndex: number) => number[];
  type CalculateTileIndex = (
    tileIndex: number,
    tileInRowIndex: number,
    howManyMerges: number,
    maxIndexInRow: number
  ) => number;

  const move = (
    retrieveTileIdsPerRowOrColumn: RetrieveTileIdsPerRowOrColumn,
    calculateFirstFreeIndex: CalculateTileIndex
  ) => {
    dispatch({ type: "START_MOVE" });
    const maxIndex = tileCountPerRowOrColumn - 1;

    for (let rowOrColumnIndex = 0; rowOrColumnIndex < tileCountPerRowOrColumn; rowOrColumnIndex++) {
      const availableTileIds = retrieveTileIdsPerRowOrColumn(rowOrColumnIndex);

      let previousTile: TileMeta | undefined;
      let mergedTilesCount = 0;

      availableTileIds.forEach((tileId, nonEmptyTileIndex) => {
        const currentTile = tiles[tileId];

        if (previousTile && previousTile.value === currentTile.value) {
          const tile: TileMeta = {
            ...currentTile,
            position: previousTile.position,
            mergeWith: previousTile.id,
          };
          throttledMergeTile(tile, previousTile);
          previousTile = undefined;
          mergedTilesCount += 1;
          return updateTile(tile);
        }

        const tile: TileMeta = {
          ...currentTile,
          position: indexToPosition(
            calculateFirstFreeIndex(
              rowOrColumnIndex,
              nonEmptyTileIndex,
              mergedTilesCount,
              maxIndex
            )
          ),
        };
        previousTile = tile;

        if (didTileMove(currentTile, tile)) updateTile(tile);
      });
    }

    setTimeout(() => dispatch({ type: "END_MOVE" }), animationDuration);
  };

  // --- Factories for directions ---

  const createMoveFactory = (
    isRow: boolean,
    reverse: boolean,
    calculateIndex: CalculateTileIndex
  ) => () => {
    const retrieveTileIds = (index: number) => {
      const tileMap = retrieveTileMap();
      const ids = Array.from({ length: tileCountPerRowOrColumn }, (_, i) =>
        isRow
          ? tileMap[index * tileCountPerRowOrColumn + i]
          : tileMap[i * tileCountPerRowOrColumn + index]
      );
      return reverse ? ids.reverse().filter((id) => id !== 0) : ids.filter((id) => id !== 0);
    };
    return move.bind(null, retrieveTileIds, calculateIndex);
  };

  const moveLeft = createMoveFactory(
    true,
    false,
    (_row, tileInRowIndex, howManyMerges) =>
      tileInRowIndex - howManyMerges
  );

  const moveRight = createMoveFactory(
    true,
    true,
    (_row, tileInRowIndex, howManyMerges, maxIndex) =>
      maxIndex + howManyMerges - tileInRowIndex
  );

  const moveUp = createMoveFactory(
    false,
    false,
    (_col, tileInColIndex, howManyMerges) =>
      tileInColIndex - howManyMerges
  );

  const moveDown = createMoveFactory(
    false,
    true,
    (_col, tileInColIndex, howManyMerges, maxIndex) =>
      maxIndex - tileInColIndex + howManyMerges
  );

  // --- Initial tile creation and random tile generation ---

  useEffect(() => {
    if (isInitialRender.current) {
      createTile({ position: [0, 1], value: 2 });
      createTile({ position: [0, 2], value: 2 });
      isInitialRender.current = false;
      return;
    }

    if (!inMotion && hasChanged) {
      generateRandomTile();
    }
  }, [hasChanged, inMotion, createTile, generateRandomTile]);

  // --- Tile list ---

  const tileList = byIds.map((tileId) => tiles[tileId]);

  return [tileList, moveLeft(), moveRight(), moveUp(), moveDown()] as const;
};
