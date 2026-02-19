(() => {
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
			let bas = [0, 1, 0, 2];
			for (let i = 0; i < new2; i++) {
				bas.push(1);
				bas.push(0);
				bas.push(5 + i * 3);
				break;
			}
			return bas;
		};
	register.push({
		id: 'pps',
		name: 'Parented predecessor sequence',
		display: sequence_display,
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
