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
			var len = seq.length;
			var x = len > 0 ? seq[len - 1] : null;
			var parentY = x;
			var rootY = null;
			var b = null;
			var badpart = [];
			var L = 0;
			var flag = false;
			if (parentY >= 1 && parentY <= len) {
				rootY = parentY;
				b = seq[rootY - 1];
				badpart = seq.slice(rootY, len - 1);
				L = len - rootY;
				flag = badpart.some((val) => val === b);
			} else {
				L = len - parentY;
			}
			var goodpart = seq.slice(0, -1);
			var result = goodpart.slice();
			for (var i = 1; i <= FSterm; i++) {
				result.push(flag ? b : x - 1);

				var bad_modified = badpart.map((val) => (val < x ? val : val + L * i));
				result = result.concat(bad_modified);
			}
			return result;
		},
		Limit = (n) => {
			if (n == 0) return [0];
			if (n == 1) return [0, 1];
			let new2 = n - 1;
			let bas = [0, 1, 0, 2, 0, 4, 4];
			for (let i = 0; i < new2; i++) {
				bas.push(4);
			}
			return bas;
		};
	register.push({
		id: 'pps',
		name: 'Parented predecessor sequence',
		display: function (seq) {
			let pairs = '';
			for (let i = 0; i < seq.length; i++) {
				if (seq[i] == 0) pairs += '()';
				else {
					let level2 = level(seq, i);
					pairs += `(${seq[i] - level2},${level2})`;
				}
			}

			return pairs;
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
