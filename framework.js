aaa = localStorage.getItem('ne-0');
d = !aaa ? {} : JSON.parse(aaa);
s = {};
for (i = 0; i < register.length; i++) {
	s[register[i].id] = d[register[i].id] ? d[register[i].id] : {};
}
const FSbounded = (FS, compare, seq, low) => {
		var res,
			n = 0;
		while (true) {
			res = FS(seq, n);
			if (compare(res, low[0]) > 0) return res;
			n++;
		}
	},
	app = Vue.createApp({
		data: () => ({
			current_tab: 0,
			FS_shown: register.map(() => 3),
			extra_FS: register.map(() => 0),
			tier: register.map(() => 1),
			datasets: register.map((notation) => notation.init()), //how the fuck can u get back the "listn't list" thing
		}),
		computed: {
			current_notation() {
				return register[this.current_tab].id;
			},
			tab_names: () => register.map((notation) => notation.name),
			tiername() {
				var n = this.tier[this.current_tab];
				if (0 <= n && n <= 8)
					return (
						[
							'small',
							'single',
							'double',
							'triple',
							'quadruple',
							'quintuple',
							'sextuple',
							'septuple',
							'octuple',
						][n] + ' expansion'
					);
				return n + '-fold expansion';
			},
		},
		methods: {
			incrFS() {
				this.FS_shown.splice(this.current_tab, 1, this.FS_shown[this.current_tab] + 1);
			},
			decrFS() {
				this.FS_shown.splice(
					this.current_tab,
					1,
					Math.max(this.FS_shown[this.current_tab] - 1, 0),
				);
			},
			incr_extra() {
				this.extra_FS.splice(this.current_tab, 1, this.extra_FS[this.current_tab] + 1);
			},
			decr_extra() {
				this.extra_FS.splice(
					this.current_tab,
					1,
					Math.max(this.extra_FS[this.current_tab] - 1, 0),
				);
			},
			incr_tier() {
				this.tier.splice(this.current_tab, 1, this.tier[this.current_tab] + 1);
			},
			decr_tier() {
				this.tier.splice(this.current_tab, 1, Math.max(this.tier[this.current_tab] - 1, 0));
			},
			reset_list() {
				this.datasets.splice(this.current_tab, 1, register[this.current_tab].init());
			},
			save() {
				localStorage.setItem('ne-0', JSON.stringify(s));
			},
			export_analysises() {
				const file = new Blob([JSON.stringify(s)], {
					type: 'application/json',
				});
				window.URL = window.URL || window.webkitURL;
				const a = document.createElement('a');
				a.href = window.URL.createObjectURL(file);
				a.download = `Analysises${Date.now()}.json`;
				a.click();
			},
			import_analysises() {
				const a = document.createElement('input');
				a.setAttribute('type', 'file');
				a.setAttribute('accept', 'application/json');
				a.click();
				a.onchange = () => {
					const fr = new FileReader();
					if (a.files == null) return void alert('未选择文件');
					fr.onload = () => {
						const save = fr.result;
						if (typeof save == 'string') {
							try {
								s = JSON.parse(save);
							} catch {
								alert('Cannot load analysises');
							}
						}
					};
					fr.readAsText(a.files[0]);
				};
			},
		},
	});
register.forEach((notation, index) => {
	app.component(notation.id + '-list', {
		props: ['expr', 'low', 'subitems', 'anal'],
		data: () => ({
			display: notation.display,
			able: notation.able,
			semiable: notation.semiable,
			compare: notation.compare,
			FS: notation.FS,
			FSalter: notation.FSalter,
			shownFS: [],
			tooltip: false,
			tooltipX: {},
		}),
		methods: {
			recalculate(event) {
				if (!this.able(this.expr)) return;
				var FS = event.shiftKey && this.FSalter ? this.FSalter : this.FS;
				var res = [],
					nmax = this.$root.FS_shown[index];
				for (var n = 0; n <= nmax; ++n)
					res.push(n + ':&nbsp;' + this.display(FS(this.expr, n)));
				this.shownFS = res;
				this.tooltipX = { left: '0px' };
				this.tooltip = true;
			},
			unshow() {
				if (!this.able(this.expr)) return;
				this.tooltip = false;
			},
			expand(event) {
				var FS = event.shiftKey && this.FSalter ? this.FSalter : this.FS;
				var expand_extra = (item) => {
						var working_low = item.low;
						for (var i = this.$root.extra_FS[index]; i--; ) {
							item.subitems.unshift({
								expr: FSbounded(FS, this.compare, item.expr, working_low),
								low: JSON.parse(JSON.stringify(working_low)),
								subitems: [],
								anal: ['???'],
							});
							working_low = [item.subitems[0].expr];
						}
						if (item.subitems[0]) item.low[0] = item.subitems[0].expr;
					},
					expand_tier = (tier, item, append) => {
						if (
							!(
								(this.able(item.expr) && extras.add(item)) ||
								(this.semiable &&
									this.semiable(item.expr) &&
									this.compare(FS(item.expr, 0), item.low[0]) > 0)
							)
						)
							return;
						console.log(s[notation.id]);
						console.log(FSbounded(FS, this.compare, item.expr, item.low));
						var newitem = {
							expr: FSbounded(FS, this.compare, item.expr, item.low),
							low: JSON.parse(JSON.stringify(item.low)),
							anal: [
								s[notation.id][FSbounded(FS, this.compare, item.expr, item.low)] !=
								undefined
									? s[notation.id][
											FSbounded(FS, this.compare, item.expr, item.low)
										]
									: '???',
							],
							subitems: [],
						};
						append.splice(
							append
								.map((x) => JSON.stringify(x.expr))
								.indexOf(JSON.stringify(item.expr)) + 1,
							0,
							newitem,
						);
						item.low[0] = newitem.expr;
						if (tier > 0) {
							expand_tier(
								tier,
								newitem,
								JSON.stringify(append[append.length - 1].expr) ===
									JSON.stringify(newitem.expr)
									? append
									: newitem.subitems,
							);
							tier > 1 &&
								expand_tier(
									tier - 1,
									newitem.subitems.length
										? newitem.subitems[newitem.subitems.length - 1]
										: newitem,
									newitem.subitems,
								);
						}
					},
					extras = new Set(),
					parentsubs = this.$parent.subitems;
				expand_tier(
					this.$root.tier[index],
					this,
					JSON.stringify(parentsubs[parentsubs.length - 1].expr) ===
						JSON.stringify(this.expr)
						? parentsubs
						: this.subitems,
				);
				extras.forEach(expand_extra);
			},
			a(b, c) {
				return c == '???'
					? '<span class="g">' + b + '</span>'
					: b + ' / <span>' + c + '</span>';
			},
			change_anal(e) {
				console.log(notation.id);
				if (this.anal === undefined || this.anal === null) this.anal = [];

				this.anal[0] = window.prompt(
					'Change the analysus of ' + this.display(e) + ' to...',
					s[notation.id][e],
				);
				console.log(s[notation.id][e]);
				console.log(this.anal[0]);
				s[notation.id][e] = this.anal[0];
			},
			hide(e) {
				if (h.includes(e)) {
					g = h.indexOf(e);
					h = h.splice(1, g - 1).concat(h.splice(g + 1, h.length));
				} else {
					h = h.concat(e);
				}
			},
			showExpand(expr) {
				try {
					return this.able(expr);
				} catch {
					return false;
				}
			},
		},
		template:
			`<li><div class="shown-item" @mouseenter="recalculate" @mouseleave="unshow()">
            <button class="a1" @mousedown="expand" v-if="showExpand(expr)">Expand</button>
            <button class="a2" @mousedown="change_anal(expr)">Change analysis</button><span v-html="a(display(expr),anal)"></span>
            <div class="anal">
            <span></div>
            <div class="tooltip" v-if="tooltip" :style="tooltipX" @mousedown.stop>
            <span v-html="display(expr)"></span> fundamental sequence:
            <div v-for="term in shownFS" v-html="term"></div>
         </div></div></div>
         </span>
         <ul>
            <` +
			notation.id +
			`-list v-for="subitem in subitems" v-bind="subitem"></` +
			notation.id +
			`-list>
         </ul>
      </li>`,
	});
	app.component(notation.id, {
		props: ['subitems'],
		template:
			`<ul class="nowrap"><` +
			notation.id +
			`-list v-for="item in subitems" v-bind="item"></` +
			notation.id +
			`-list></ul>`,
	});
});
var root = app.mount('#app');
window.addEventListener('keydown', (e) => {
	if (e.ctrlKey || e.altKey || e.shiftKey || e.metaKey) return;
	var k = e.key;
	if (0 <= k && k <= 9) {
		root.tier.splice(root.current_tab, 1, +k);
	} else {
		switch (k) {
			case ',':
			case '<':
				root.decrFS();
				break;
			case '.':
			case '>':
				root.incrFS();
				break;
			case '-':
			case '_':
				root.decr_extra();
				break;
			case '=':
			case '+':
				root.incr_extra();
				break;
		}
	}
});
setInterval(function () {
	localStorage.setItem('ne-0', JSON.stringify(s));
}, 5000);
