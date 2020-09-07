// faire un cellsVisibleByQueen

// 1. placer une queen sur la 1ere cell dispo
// 2. ajouter la liste des cells qu'elle voit à la liste de toutes celles vues par une reine quelconque
// 3. placer la queen suivante sur la 1ere cell dispo
// 4. Faire ça de maniere recursive, de façon à ce qu'a chaque "echec / blocage" on place la queen sur la cell dispo suivante

type QueenMap = CellStatus[][];

enum CellStatus {
  "free",
  "visible",
  "occupied",
}

const mainQueen = () => {
  const initMap = _createMap();
  console.log("----> initMap");
  initMap.forEach((row) => console.log(`${row}`));

  const initRow = 4;
  const initColumn = 4;
  const mapWithFirstQueen = _placeQueen(initMap, 4, 4);
  console.log("----> Map with First queen");
  mapWithFirstQueen.forEach((row) => console.log(`${row}`));

  console.log("init");
  initMap.forEach((row) => console.log(`${row}`));

  const result = _immediateVisibilityFromCell(mapWithFirstQueen, 4, 4);
  console.log("----> result");
  result.forEach((row) => console.log(`${row}`));

  console.log("init");
  initMap.forEach((row) => console.log(`${row}`));
};

/** Create 8x8 map */
const _createMap = () => {
  let map: QueenMap = [];
  const length = 8;
  for (let index = 0; index < length; index++)
    map.push([...Array(length)].map((x) => CellStatus.free));
  return map;
};

const _placeQueen = (map: QueenMap, row: number, column: number) => {
  let mapClone = cloneDeepBasically(map);
  mapClone[row][column] = CellStatus.occupied;
  return mapClone;
};

const _immediateVisibilityFromCell = (
  map: QueenMap,
  row: number,
  column: number
) => {
  let mapClone = cloneDeepBasically(map);

  for (let rowDirection = -1; rowDirection <= 1; rowDirection++) {
    if (_isOutsideRowsLimits(mapClone, row, rowDirection)) continue;
    for (let columnDirection = -1; columnDirection <= 1; columnDirection++) {
      if (_isOutsideColumnsLimits(mapClone, column, columnDirection)) continue;
      mapClone = _innerVisibilityFromCell(
        mapClone,
        row,
        column,
        rowDirection,
        columnDirection
      );
    }
  }
  return mapClone;
};

const _innerVisibilityFromCell = (
  map: QueenMap,
  row: number,
  column: number,
  rowDirection: number,
  columnDirection: number
) => {
  let mapClone = cloneDeepBasically(map);

  // Case 01 : Precoce return
  if (
    _isOutsideRowsLimits(mapClone, row, rowDirection) ||
    _isOutsideColumnsLimits(mapClone, column, columnDirection) ||
    _cellAlreadyChecked(mapClone, column, columnDirection, row, rowDirection)
  )
    return mapClone;

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
  map: QueenMap,
  row: number,
  rowDirection: number
) => row + rowDirection < 0 || row + rowDirection >= map.length;

const _isOutsideColumnsLimits = (
  map: QueenMap,
  column: number,
  columnDirection: number
) => column + columnDirection < 0 || column + columnDirection >= map[0].length;

const _cellAlreadyChecked = (
  map: QueenMap,
  column: number,
  columnDirection: number,
  row: number,
  rowDirection: number
) => map[row + rowDirection][column + columnDirection] !== CellStatus.free;

/** Clone basic nested arrays
 * i.e. : excludes dates, undefined, maps, blobs, etc
 * https://medium.com/javascript-in-plain-english/how-to-deep-copy-objects-and-arrays-in-javascript-7c911359b089
 */
const cloneDeepBasically = (input: QueenMap): QueenMap =>
  JSON.parse(JSON.stringify(input));

// ################################################
// ################################################
// ################# EXECUTION ####################
// ################################################
// ################################################

mainQueen();
