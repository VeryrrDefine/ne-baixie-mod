// 魂兮归来
(() => {
	function notsub(seq, index) {
		const 父项序号 = index;
		坏根序号 = 父项序号;
		坏根值 = seq[坏根序号 - 1];
		坏部 = seq.slice(坏根序号, index);
		白根存在 = 坏部.some((val) => val === 坏根值);
		return seq.slice(seq[index], index).includes(seq[seq[index] - 1]);
	}
	function level(seq, index) {
		if (seq[0] === Infinity) return 0;
		if (seq[index] == 0) return 0;
		if (notsub(seq, index)) return 0;
		else {
			let s = [...seq];
			s[index]--;
			return level(s, index) + 1;
		}
	}

	var expand = (seq, FSterm) => {
			const arr = seq;
			const n = FSterm;
			const Y = arr.length;
			const X = arr[Y - 1];

			if (X === 0) {
				const result = arr.slice(0, -1);
				return result;
			}

			if (X > Y) {
				throw new Error(`末项值 ${X} 作为列标超出序列长度 ${Y}，无法找到坏根。`);
			}
			const B = arr[X - 1];
			const L = Y - X;

			let v;
			const betweenStart = X + 1;
			const betweenEnd = Y - 1;
			let existsEqualB = false;
			for (let col = betweenStart; col <= betweenEnd; col++) {
				if (arr[col - 1] === B) {
					existsEqualB = true;
					break;
				}
			}

			if (existsEqualB) {
				v = B;
			} else {
				const strongStart = B + 1;
				const strongEnd = X - 1;
				let foundCol = null;
				if (strongStart <= strongEnd) {
					for (let col = strongEnd; col >= strongStart; col--) {
						if (arr[col - 1] <= B) {
							foundCol = col;
							break;
						}
					}
				}
				if (foundCol !== null) {
					v = foundCol;
				} else {
					v = B;
				}
			}

			const totalLen = Y + n * L - 1;
			const res = new Array(totalLen);

			for (let i = 0; i < X; i++) {
				res[i] = arr[i];
			}

			for (let i = X; i < Y - 1; i++) {
				res[i] = arr[i];
			}
			res[Y - 1] = v;

			for (let i = X; i < Y; i++) {
				const baseVal = i === Y - 1 ? v : arr[i];
				const ge = baseVal >= X;
				const maxK = i === Y - 1 ? n - 1 : n;

				for (let k = 1; k <= maxK; k++) {
					const pos = i + k * L;
					if (pos >= totalLen) continue;
					if (ge) {
						res[pos] = baseVal + k * L;
					} else {
						res[pos] = baseVal;
					}
				}
			}

			return res;
		},
		Limit = (n) => {
			if (n == 0) return [0];
			if (n == 1) return [0, 1];
			let new2 = n - 1;
			let bas = [0, 1];
			for (let i = 0; i < new2; i++) {
				bas.push(i + 2);
			}
			return bas;
		};
	register.push({
		id: 'pps',
		name: 'Parented predecessor sequence 4',
		display: function (seq) {
			return sequence_display(seq);
		},
		able: (seq) => seq[seq.length - 1] > 0,
		compare: sequence_compare,
		FS: (m, FSterm) => {
			if ('' + m === 'Infinity') return Limit(FSterm);
			if (m.length === 0) return [];
			return expand(m, FSterm);
		},
		init: () => [
			{ expr: [[Infinity]], low: [[]], subitems: [], anal: ['bx'] },
			{ expr: [], low: [[]], subitems: [], anal: ['0'] },
		],
		semiable: (seq) => seq.length > 0,
	});
})();
