type Plus1Ind = number;
type Plus0Ind = number;
type Value = number;
function pps(array: number[], FSterm: number) {
	if (array.at(-1) == 0) return array.slice(0, array.length - 1);
	let badrootIndex: Plus1Ind = array.at(-1) as Plus1Ind;
	let L: Value = array.length - (array.at(-1) as Value);
	let b: Value = array.at(badrootIndex - 1) as Value;
	let x: Value = array.at(-1) as Value;
	let y: Plus1Ind = array.length;

	let check1 = array.slice(badrootIndex - 1 + 1, y - 1);
	let weakExpand = check1.includes(b);

	let newArray = Array.from(array).slice(0, array.length - 1);
	let expandTo: Plus1Ind = y + FSterm * L - 1;
	console.log('Weakexpand', weakExpand);
	let badPartLength = array.length - badrootIndex;
	console.log('BadPartLength', badPartLength);
	for (let i = newArray.length - 2; i < expandTo - 1; i++) {
		// newArray.push(0);
	}
	// if (weakExpand) {
	// 	newArray[newArray.length - 1] = b;
	// 	// 不会写了
	// } else {
	// 	let check = array.slice(b - 1 + 1, x - 1);
	// 	let finded = false;
	// 	for (let i = check.length - 1; i--; i >= 0) {
	// 		if (check[i] == b) {
	// 			newArray[newArray.length - 1] = i + 1;
	// 			finded = true;
	// 		}
	// 	}
	// 	if (finded) {
	// 	} else {
	// 		newArray[newArray.length - 1] = b;
	// 		// 不会写了
	// 	}
	// }
	return newArray;
}

console.log(pps([0, 1], 3));
