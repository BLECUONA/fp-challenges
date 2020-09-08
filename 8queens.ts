// faire un cellsVisibleByQueen

// 1. placer une queen sur la 1ere cell dispo
// 2. ajouter la liste des cells qu'elle voit à la liste de toutes celles vues par une reine quelconque
// 3. placer la queen suivante sur la 1ere cell dispo
// 4. Faire ça de maniere recursive, de façon à ce qu'a chaque "echec / blocage" on place la queen sur la cell dispo suivante

type ChessMap = CellStatus[][];

enum CellStatus {
  free,
  visible,
  occupied,
}

const mainQueen = () => {
  let initMap = _createMap();

  const updatedMap = _solver(initMap)();

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

const _solver = (initMap: ChessMap) => {
  let initRowMemo = 0;
  let initColumnMemo = 0;

  const solve = () => {
    let updatedMap = deepClone(initMap);

    let mapWithNewQueen = _placeQueenIfNotVisible(
      updatedMap,
      initRowMemo,
      initColumnMemo
    );
    if (mapWithNewQueen === null) {
      // TODO: voir si vraiment utile
      initRowMemo += 1;
      initColumnMemo += 1;
      return solve();
    }
    updatedMap = mapWithNewQueen;

    for (let index = 1; index < 8; index++) {
      // TODO: remplacer 8 par une variable
      for (let row = 0; row < 8; row++) {
        let haveToBeStopped: boolean = false;

        for (let column = 0; column < 8; column++) {
          const mapWithNewQueen = _placeQueenIfNotVisible(
            updatedMap,
            row,
            column
          );

          if (mapWithNewQueen !== null) {
            haveToBeStopped = true;
            updatedMap = mapWithNewQueen;
            break;
          }

          if (column === 7 && row === 7) {
            // TODO: voir à remplacer les number par des variables
            if (initColumnMemo === 7 && initRowMemo <= 6) {
              initRowMemo += 1;
              initColumnMemo = 0;
            } else if (initColumnMemo <= 6) {
              initColumnMemo += 1;
            } else if (initRowMemo === 7 && initColumnMemo === 7)
              throw new Error("IMPOSSIBLE TO SOLVE");

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

const _placeQueenIfNotVisible = (
  initMap: ChessMap,
  row: number,
  column: number
): ChessMap | null => {
  if (
    initMap[row][column] === CellStatus.visible ||
    initMap[row][column] === CellStatus.occupied
  )
    return null;

  const mapWithNewQueen = _placeQueenByForce(initMap, row, column);

  if (mapWithNewQueen === null) return null;

  return _immediateVisibilityFromCell(mapWithNewQueen, row, column);
};

const _placeQueenByForce = (
  map: ChessMap,
  row: number,
  column: number
): ChessMap | null => {
  let mapClone = deepClone(map);
  let cellToUpdate = mapClone[row][column];
  if (
    cellToUpdate === CellStatus.occupied ||
    cellToUpdate === CellStatus.visible
  )
    return null;
  mapClone[row][column] = CellStatus.occupied;
  return mapClone;
};

const _immediateVisibilityFromCell = (
  map: ChessMap,
  row: number,
  column: number
): ChessMap | null => {
  let mapClone = deepClone(map);

  for (let rowDirection = -1; rowDirection <= 1; rowDirection++) {
    if (_isOutsideRowsLimits(mapClone, row, rowDirection)) continue;
    for (let columnDirection = -1; columnDirection <= 1; columnDirection++) {
      if (_isOutsideColumnsLimits(mapClone, column, columnDirection)) continue;
      if (rowDirection === 0 && columnDirection === 0) continue;

      const res = _innerVisibilityFromCell(
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

const _innerVisibilityFromCell = (
  map: ChessMap,
  row: number,
  column: number,
  rowDirection: number,
  columnDirection: number
): ChessMap | null => {
  let mapClone = deepClone(map);

  // Case 01 : Precoce return
  if (
    _isOutsideRowsLimits(mapClone, row, rowDirection) ||
    _isOutsideColumnsLimits(mapClone, column, columnDirection)
  )
    return mapClone;

  if (
    _cellAlreadyOccupied(mapClone, column, columnDirection, row, rowDirection)
  ) {
    // console.log("_________ NULL HERE");
    // return mapClone;
    return null;
  }

  // Case 02 :Recursivity
  mapClone[row + rowDirection][column + columnDirection] = CellStatus.visible;
  return _innerVisibilityFromCell(
    mapClone,
    row + rowDirection,
    column + columnDirection,
    rowDirection,
    columnDirection
  );
};

const _isOutsideRowsLimits = (
  map: ChessMap,
  row: number,
  rowDirection: number
) => row + rowDirection < 0 || row + rowDirection >= map.length;

const _isOutsideColumnsLimits = (
  map: ChessMap,
  column: number,
  columnDirection: number
) => column + columnDirection < 0 || column + columnDirection >= map[0].length;

const _cellAlreadyOccupied = (
  map: ChessMap,
  column: number,
  columnDirection: number,
  row: number,
  rowDirection: number
) => map[row + rowDirection][column + columnDirection] === CellStatus.occupied;

/** Clone basic nested arrays
 * i.e. : excludes dates, undefined, maps, blobs, etc
 * https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
 */
const deepClone = (input: ChessMap): ChessMap =>
  JSON.parse(JSON.stringify(input));

class AlreadyOccupiedError extends Error {}

// ################################################
// ################################################
// ################# EXECUTION ####################
// ################################################
// ################################################

mainQueen();
