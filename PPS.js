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
			let bas = [0, 1];
			// 0,1,
			// 0,2, 2, 0,5, 2, 0,8, 8, 8,  6,2,
			// 0,14,14,0,17,14,0,20,20,20,18,14,
			// 0,26,26,0,29,26,0,32,32,32,30,26,
			// 0,38,38,0,41,38,0,44,44,44,42,38,
			// 0,50,50,0,53,50,0,56,56,56,54,50,
			// 0,62,62,0,65,62,0,68,68,68,66,62

			for (let i = 0; i < new2; i++) {
				switch (i % 4) {
					case 0:
						bas.push(0);
						bas.push(Math.floor(i / 4) * 12 + 2);
						bas.push(Math.floor(i / 4) * 12 + 2);
						break;
					case 1:
						bas.push(0);
						bas.push(Math.floor(i / 4) * 12 + 5);
						bas.push(Math.floor(i / 4) * 12 + 2);
						break;
					case 2:
						bas.push(0);
						bas.push(Math.floor(i / 4) * 12 + 8);
						bas.push(Math.floor(i / 4) * 12 + 8);
						bas.push(Math.floor(i / 4) * 12 + 8);
						break;
					case 3:
						bas.push(Math.floor(i / 4) * 12 + 6);
						bas.push(Math.floor(i / 4) * 12 + 2);
						break;
				}
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
