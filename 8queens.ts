type ChessMap = CellStatus[][];

enum CellStatus {
  free,
  visible,
  occupied,
}

/** Main program */
const mainQueen = (queensNumber: number) => {
  let initMap = _createMap();

  const updatedMap = _solver(initMap, queensNumber)();

  console.log(
    `RESULT (${CellStatus.occupied} -> Queen | ${CellStatus.visible} -> Visible by queens | ${CellStatus.free} -> Free & no visible by any queen)`
  );
  updatedMap.forEach((row) => console.log(`${row}`));
};

/** Create 8x8 map */
const _createMap = () => {
  let map: ChessMap = [];
  const length = 8;
  for (let index = 0; index < length; index++)
    map.push([...Array(length)].map(() => CellStatus.free));
  return map;
};

/** Solver using memoization */
const _solver = (initMap: ChessMap, queensNumber: number) => {
  let initRowMemo = 0;
  let initColumnMemo = 0;

  const incrementMemo = () => {
    if (initColumnMemo === 7 && initRowMemo <= 6) {
      initRowMemo += 1;
      initColumnMemo = 0;
    } else if (initColumnMemo <= 6) {
      initColumnMemo += 1;
    } else if (initRowMemo === 7 && initColumnMemo === 7)
      throw new Error("IMPOSSIBLE TO SOLVE");
  };

  // Returned function from _solver()
  const solve = () => {
    let updatedMap = deepClone(initMap);

    let mapWithNewQueen = _placeQueenIfUnvisibleFromOthers(
      updatedMap,
      initRowMemo,
      initColumnMemo
    );
    if (mapWithNewQueen === null) {
      incrementMemo();
      return solve();
    }
    updatedMap = mapWithNewQueen;

    for (let index = 1; index < queensNumber; index++) {
      for (let row = 0; row < updatedMap.length; row++) {
        let haveToBeStopped: boolean = false;

        for (let column = 0; column < updatedMap[0].length; column++) {
          const mapWithNewQueen = _placeQueenIfUnvisibleFromOthers(
            updatedMap,
            row,
            column
          );

          if (mapWithNewQueen !== null) {
            haveToBeStopped = true;
            updatedMap = mapWithNewQueen;
            break;
          }

          if (
            row === updatedMap.length - 1 &&
            column === updatedMap[0].length - 1
          ) {
            incrementMemo();
            return solve();
          }
        }
        if (haveToBeStopped) break;
      }
    }
    return updatedMap;
  };

  return solve;
};

const _placeQueenIfUnvisibleFromOthers = (
  initMap: ChessMap,
  row: number,
  column: number
): ChessMap | null => {
  if (_isOutsideRowsLimits(initMap, row)) return null;
  if (_isOutsideColumnsLimits(initMap, column)) return null;
  if (_cellAlreadyVisibleOrOccupied(initMap, column, row)) return null;

  const mapWithNewQueen = _placeQueenByForce(initMap, row, column);

  return _addImmediateQueenVisibility(mapWithNewQueen, row, column);
};

const _placeQueenByForce = (
  map: ChessMap,
  row: number,
  column: number
): ChessMap => {
  let mapClone = deepClone(map);
  mapClone[row][column] = CellStatus.occupied;
  return mapClone;
};

const _addImmediateQueenVisibility = (
  map: ChessMap,
  row: number,
  column: number
): ChessMap | null => {
  let mapClone = deepClone(map);

  for (let rowDirection = -1; rowDirection <= 1; rowDirection++) {
    if (_isOutsideRowsLimits(mapClone, row + rowDirection)) continue;
    for (let columnDirection = -1; columnDirection <= 1; columnDirection++) {
      if (_isOutsideColumnsLimits(mapClone, column + columnDirection)) continue;
      if (rowDirection === 0 && columnDirection === 0) continue;

      const res = _addDistantQueenVisibility(
        mapClone,
        row,
        column,
        rowDirection,
        columnDirection
      );
      if (res === null) return res;
      mapClone = res;
    }
  }
  return mapClone;
};

const _addDistantQueenVisibility = (
  map: ChessMap,
  row: number,
  column: number,
  rowDirection: number,
  columnDirection: number
): ChessMap | null => {
  let mapClone = deepClone(map);

  // Case 01 : Exceptions
  if (
    _isOutsideRowsLimits(mapClone, row + rowDirection) ||
    _isOutsideColumnsLimits(mapClone, column + columnDirection)
  )
    return mapClone;

  if (
    _cellAlreadyOccupied(mapClone, row + rowDirection, column + columnDirection)
  ) {
    return null;
  }

  // Case 02 : Recursivity
  mapClone[row + rowDirection][column + columnDirection] = CellStatus.visible;
  return _addDistantQueenVisibility(
    mapClone,
    row + rowDirection,
    column + columnDirection,
    rowDirection,
    columnDirection
  );
};

const _isOutsideRowsLimits = (map: ChessMap, row: number) =>
  row < 0 || row >= map.length;

const _isOutsideColumnsLimits = (map: ChessMap, column: number) =>
  column < 0 || column >= map[0].length;

const _cellAlreadyOccupied = (map: ChessMap, row: number, column: number) =>
  map[row][column] === CellStatus.occupied;

const _cellAlreadyVisibleOrOccupied = (
  map: ChessMap,
  column: number,
  row: number
) =>
  map[row][column] === CellStatus.visible ||
  map[row][column] === CellStatus.occupied;

/** Clone basic nested arrays
 * i.e. : excludes dates, undefined, maps, blobs, etc
 * https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
 */
const deepClone = (input: ChessMap): ChessMap =>
  JSON.parse(JSON.stringify(input));

// ################################################
// ################################################
// ################# EXECUTION ####################
// ################################################
// ################################################

mainQueen(8);
