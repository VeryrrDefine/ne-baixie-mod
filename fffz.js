(function () {
	// code from Alice
	class Ordinal {
		constructor(terms = []) {
			this.terms = terms;
		}

		static zero() {
			return new Ordinal([]);
		}

		static fromNat(n) {
			if (n === 0) return Ordinal.zero();
			return new Ordinal([[Ordinal.zero(), n]]);
		}

		isZero() {
			return this.terms.length === 0;
		}

		static compare(a, b) {
			let A = a.terms,
				B = b.terms;
			let i = 0;

			while (i < A.length && i < B.length) {
				let [ae, ac] = A[i];
				let [be, bc] = B[i];

				let t = Ordinal.compare(ae, be);
				if (t !== 0) return t;

				if (ac !== bc) return ac - bc;

				i++;
			}

			return A.length - B.length;
		}

		static add(a, b) {
			if (a.isZero()) return b;
			if (b.isZero()) return a;

			const A = a.terms.map(([e, c]) => [new Ordinal(e.terms), c]);
			const B = b.terms.map(([e, c]) => [new Ordinal(e.terms), c]);

			const [be, bc] = B[0];

			while (A.length > 0) {
				const [ae] = A[A.length - 1];
				if (Ordinal.compare(ae, be) < 0) A.pop();
				else break;
			}

			if (A.length > 0 && Ordinal.compare(A[A.length - 1][0], be) === 0) {
				A[A.length - 1][1] += bc;
				B.shift();
			}

			const newTerms = [...A, ...B];
			return new Ordinal(newTerms);
		}

		static mul(a, b) {
			if (a.isZero() || b.isZero()) return Ordinal.zero();

			let B = b.terms;
			let [be, bc] = B[0];

			let res = [];

			for (let [ae, ac] of a.terms) {
				let newExp = Ordinal.add(ae, be);
				res.push([newExp, ac * bc]);
			}

			let rest = Ordinal.mul(a, new Ordinal(B.slice(1)));

			return Ordinal.add(new Ordinal(res), rest);
		}

		static omega() {
			return new Ordinal([[Ordinal.fromNat(1), 1]]);
		}

		static isOmega(o) {
			return (
				o.terms.length === 1 &&
				o.terms[0][1] === 1 &&
				Ordinal.compare(o.terms[0][0], Ordinal.fromNat(1)) === 0
			);
		}

		static printStr(o) {
			if (o.isZero()) return '0';
			return o.terms
				.map(([e, c]) => {
					let expStr;
					if (e.isZero()) {
						expStr = '';
					} else {
						const expPrint = Ordinal.printStr(e);
						if (expPrint === '1') {
							expStr = 'ω';
						} else if (expPrint.includes('+') || expPrint.includes('*')) {
							expStr = `ω^(${expPrint})`;
						} else {
							expStr = `ω^${expPrint}`;
						}
					}
					if (expStr === '') return String(c);
					if (c === 1) return expStr;
					return expStr + '*' + c;
				})
				.join('+');
		}

		static readStr(str) {
			let i = 0;

			function skip() {
				while (str[i] === ' ') i++;
			}

			function peek() {
				skip();
				return str[i];
			}

			function consume(c) {
				skip();
				if (str[i] === c) i++;
				else throw 'Expected ' + c;
			}

			function parseExpr() {
				let left = parseTerm();
				while (true) {
					skip();
					if (peek() === '+') {
						consume('+');
						let right = parseTerm();
						left = Ordinal.add(left, right);
					} else break;
				}
				return left;
			}

			function parseTerm() {
				let left = parsePow();
				while (true) {
					skip();
					if (peek() === '*') {
						consume('*');
						let right = parsePow();
						if (right.terms.length !== 1 || !right.terms[0][0].isZero())
							throw 'Coefficient must be natural number';
						let n = right.terms[0][1];
						left = Ordinal.mul(left, Ordinal.fromNat(n));
					} else break;
				}
				return left;
			}

			function parsePow() {
				let base = parseAtom();
				skip();

				if (peek() === '^') {
					consume('^');
					let exp = parsePow();

					if (!Ordinal.isOmega(base)) throw 'Only ω^x supported';

					return new Ordinal([[exp, 1]]);
				}

				return base;
			}

			function parseAtom() {
				skip();

				if (peek() === '(') {
					consume('(');
					let x = parseExpr();
					consume(')');
					return x;
				}

				if (str[i] === 'ω') {
					i++;
					return Ordinal.omega();
				}

				if (/[0-9]/.test(str[i])) {
					let num = 0;
					while (/[0-9]/.test(str[i])) {
						num = num * 10 + (str[i++] - '0');
					}
					return Ordinal.fromNat(num);
				}

				throw 'Unexpected character: ' + str[i];
			}

			let res = parseExpr();
			return res;
		}

		static printLatex(o) {
			if (o.isZero()) return '0';
			return o.terms
				.map(([e, c]) => {
					let expStr;
					if (e.isZero()) {
						expStr = '';
					} else {
						const expPrint = Ordinal.printLatex(e);
						if (expPrint === '1') {
							expStr = '\\omega';
						} else {
							expStr = `\\omega^{${expPrint}}`;
						}
					}
					if (expStr === '') return String(c);
					if (c === 1) return expStr;
					return expStr + '\\times' + c;
				})
				.join('+');
		}
	}

	function dwaFFFZ(mode = 'Actual') {
		class fffz {
			static mode = mode;

			constructor(terms = [], core = null, isZero = false) {
				this.fake = terms;
				this.core = core;
				this.isZero = isZero;
			}

			static zero() {
				return new fffz([], null, true);
			}

			static isValid(obj) {
				if (!(obj instanceof fffz)) return false;

				if (obj.isZero) return true;

				if (!(obj.core instanceof fffz)) return false;

				if (!Array.isArray(obj.fake)) return false;
				for (let item of obj.fake) {
					if (!(item instanceof fffz)) return false;
				}

				return true;
			}

			static equals(a, b) {
				if (!(a instanceof fffz) || !(b instanceof fffz)) return false;

				if (a.isZero && b.isZero) return true;
				if (a.isZero || b.isZero) return false;

				if (!fffz.equals(a.core, b.core)) return false;

				if (a.fake.length !== b.fake.length) return false;

				for (let i = 0; i < a.fake.length; i++) {
					if (!fffz.equals(a.fake[i], b.fake[i])) return false;
				}

				return true;
			}

			isStrong() {
				return this.fake.length === 0;
			}

			isSucc() {
				if (this.isZero) return true;

				if (this.fake.length === 0 && this.core.isZero) return true;

				if (this.fake.length === 0) return false;

				const last = this.fake[this.fake.length - 1];
				if (!last.isSucc()) return false;

				return this.core.isSucc();
			}

			prev() {
				if (!this.isSucc()) return this;

				if (this.isZero) return this;

				if (this.fake.length === 0 && this.core.isZero) {
					return fffz.zero();
				}

				const newFake = [...this.fake];
				const corePrev = this.core.prev();
				const last = this.fake[this.fake.length - 1];

				if (fffz.equals(last, this.core)) {
					newFake.pop();
					return new fffz(newFake, corePrev, false);
				}

				return new fffz(newFake, corePrev, false);
			}

			succ() {
				if (this.isZero) {
					return new fffz([], fffz.zero(), false);
				}

				const coreSucc = this.core.succ();
				const newFake = [...this.fake];

				if (newFake.length === 0 || !newFake[newFake.length - 1].isSucc()) {
					newFake.push(coreSucc);
					return new fffz(newFake, coreSucc, false);
				}

				return new fffz(newFake, coreSucc, false);
			}

			static isLess(a, b) {
				if (a.isZero && !b.isZero) return true;
				if (!a.isZero && b.isZero) return false;
				if (a.isZero && b.isZero) return false;

				const seqA = [...a.fake, a.core];
				const seqB = [...b.fake, b.core];

				const len = Math.min(seqA.length, seqB.length);

				for (let i = 0; i < len; i++) {
					if (fffz.equals(seqA[i], seqB[i])) continue;
					return fffz.isLess(seqA[i], seqB[i]);
				}

				if (seqA.length !== seqB.length) {
					return seqA.length > seqB.length;
				}

				return false;
			}

			static compare(a, b) {
				if (fffz.equals(a, b)) return 0;
				if (fffz.isLess(a, b)) return -1;
				return 1;
			}

			static strongCore(x) {
				let cur = x;
				while (!cur.isStrong()) {
					cur = cur.core;
				}
				return cur;
			}

			static cmpStrengthCache = new Map();

			static cmpStrength(a, b) {
				const key = `${fffz.mode} ${a.printNat()} ${b.printNat()}`;
				if (fffz.cmpStrengthCache.has(key)) {
					return fffz.cmpStrengthCache.get(key);
				}
				console.log('cmpStrength', key);

				if (a.isZero && b.isZero) {
					fffz.cmpStrengthCache.set(key, 0);
					return 0;
				}
				if (a.isZero) {
					fffz.cmpStrengthCache.set(key, -1);
					return -1;
				}
				if (b.isZero) {
					fffz.cmpStrengthCache.set(key, 1);
					return 1;
				}

				let curA = fffz.mode === 'Actual' ? fffz.fullUnnest(a) : a;
				let curB = fffz.mode === 'Actual' ? fffz.fullUnnest(b) : b;

				if (fffz.equals(curA, curB)) {
					fffz.cmpStrengthCache.set(key, 0);
					return 0;
				}

				function isTrueLimit(x) {
					if (x.isStrong()) return true;
					const candidate = [...x.fake, x.core];
					return fffz.isCompatible(candidate);
				}

				const isLimitA = isTrueLimit(curA);
				const isLimitB = isTrueLimit(curB);

				if (isLimitA && isLimitB) {
					const cmpCore = fffz.cmpStrength(curA.core, curB.core);
					if (cmpCore !== 0) {
						fffz.cmpStrengthCache.set(key, cmpCore);
						return cmpCore;
					}

					if (fffz.mode === 'Actual' && curA.core.isSucc() && curB.core.isSucc()) {
						fffz.cmpStrengthCache.set(key, 0);
						return 0;
					}

					const valCmp = fffz.compare(curA, curB);
					fffz.cmpStrengthCache.set(key, valCmp);
					return valCmp;
				}

				const getJudge = (x, isLimit) => {
					if (isLimit && fffz.mode === 'Actual' && x.core.isSucc()) return fffz.omega;
					if (isLimit) return x;
					return x.fake[x.fake.length - 1];
				};
				let judgeA = getJudge(curA, isLimitA);
				let judgeB = getJudge(curB, isLimitB);
				if (fffz.mode === 'Actual') {
					judgeA = fffz.fullUnnest(judgeA);
					judgeB = fffz.fullUnnest(judgeB);
				}
				console.log('judge', judgeA.printNat(), judgeB.printNat());

				let cmpJudge = fffz.cmpStrength(judgeA, judgeB);
				if (cmpJudge === 0) {
					const valCmp = fffz.compare(judgeA, judgeB);
					if (valCmp !== 0) {
						cmpJudge = valCmp;
					}
				}

				let result;
				if (cmpJudge !== 0) {
					if (cmpJudge > 0) {
						const newB = curB.core;
						result = fffz.cmpStrength(curA, newB);
					} else {
						const newA = curA.core;
						result = fffz.cmpStrength(newA, curB);
					}
				} else {
					let newA = curA;
					let newB = curB;

					if (!isLimitA || (fffz.mode === 'Actual' && curA.core.isSucc()))
						newA = curA.core;
					if (!isLimitB || (fffz.mode === 'Actual' && curB.core.isSucc()))
						newB = curB.core;

					const newFakeA = [newA, fffz.add(newA, newB)];
					const newFakeB = [newB, fffz.add(newB, newA)];
					const compatA = fffz.isCompatible(newFakeA);
					const compatB = fffz.isCompatible(newFakeB);
					if (compatA && !compatB) return 1;
					if (!compatA && compatB) return -1;
					result = fffz.cmpStrength(newA, newB);
				}

				fffz.cmpStrengthCache.set(key, result);
				return result;
			}

			static unnest(a) {
				if (a.isZero) return fffz.zero();

				if (a.isStrong()) return fffz.zero();

				const candidateCore = a.core.succ();
				const candidateFake = [...a.fake, candidateCore];

				if (fffz.isCompatibleRaw(candidateFake)) {
					return fffz.zero();
				}

				return a.core;
			}

			static fullUnnest(a) {
				if (a.isZero) return fffz.zero();

				let cur = a;
				while (true) {
					const next = fffz.unnest(cur);
					if (next.isZero) break;
					cur = next;
				}
				return cur;
			}

			static getVirtual(x) {
				if (x.isZero) return fffz.zero();
				const succX = x.succ();
				return new fffz(succX.fake, succX.fake[succX.fake.length - 1], false);
			}

			static peel(a, b) {
				if (a.isZero) return b;
				if (b.isZero) return fffz.zero();

				const virtualA = fffz.getVirtual(a);
				const virtualB = fffz.getVirtual(b);

				//console.log("virtual: ", virtualA.printFancy(), "  ", virtualB.printFancy());

				const cmp = fffz.compare(virtualA, virtualB);
				if (cmp === 0) {
					let returnB;
					if (!b.isStrong()) {
						const lastFake = b.fake[b.fake.length - 1];
						const adjustedLast = lastFake.prev();
						if (fffz.isLess(b, virtualB)) {
							//console.log("no peel return zero");
							returnB = fffz.zero();
						} else {
							//console.log("peel because ", virtualB.printFancy(), "<=", b.printFancy());
							if (fffz.unnest(a).isZero) {
								returnB = fffz.fullPeel(adjustedLast, b.core);
							} else {
								returnB = b.core;
							}
						}
					} else {
						returnB = fffz.zero();
					}
					return returnB;
				} else if (cmp < 0) {
					return b;
				} else {
					return fffz.zero();
				}
			}

			static fullPeel(a, b) {
				if (a.isZero) return b;

				let curA = a;
				let curB = b;
				while (!curA.isZero) {
					const peeled = fffz.peel(curA, curB);
					if (fffz.equals(peeled, curB)) {
						return curB;
					}
					curB = peeled;
					curA = fffz.unnest(curA);
				}
				return curB;
			}

			static add(a, b) {
				if (a.isZero) return b;

				const a1 = a.succ();

				const vb = fffz.getVirtual(b);

				let prev = null;
				let cur = a1;

				while (true) {
					if (cur.isZero || fffz.isLess(cur, vb)) break;
					prev = cur;
					cur = cur.core;
				}

				let newA;
				if (prev === null) {
					newA = b;
				} else {
					function replace(obj) {
						if (obj === prev) {
							return new fffz(obj.fake, b, false);
						}
						if (obj.isZero) return obj;
						return new fffz(obj.fake, replace(obj.core), false);
					}
					newA = replace(a1);
				}

				return newA;
			}

			static isBounded(fake) {
				//const key = fake.map(x => x.printFancy()).join(',');
				//console.log("isBounded called on", key);

				if (!Array.isArray(fake) || fake.length < 2) return true;
				for (let i = 0; i < fake.length - 1; i++) {
					const a = fake[i];
					const b = fake[i + 1];

					if (!fffz.isLess(a, b)) return false;
					const bound = new fffz(fake.slice(0, i), a, false);
					if (!fffz.isLess(b, bound)) return false;
				}
				return true;
			}

			static isNonDouble(fake) {
				//const key = fake.map(x => x.printFancy()).join(',');
				//console.log("isNonDouble called on", key);

				if (!Array.isArray(fake) || fake.length < 2) return true;
				const last = fake[fake.length - 1];
				const secondLast = fake[fake.length - 2];
				return !(secondLast.isSucc() && last.isSucc());
			}

			static isNonRepel(fake) {
				//const key = fake.map(x => x.printFancy()).join(',');
				//console.log("isNonRepel called on", key);

				if (!Array.isArray(fake) || fake.length <= 2) return true;
				const last = fake[fake.length - 1];

				let targetIndex = -1;
				for (let i = fake.length - 2; i >= 0; i--) {
					if (fffz.cmpStrength(fake[i], last) >= 0) {
						targetIndex = i;
						break;
					}
				}
				if (targetIndex === -1) return true;

				const aFull = fffz.fullUnnest(fake[targetIndex]);
				const bFull = fffz.fullUnnest(last);
				const newFake = [aFull, fffz.add(aFull, bFull)];
				return fffz.isCompatible(newFake);
			}

			static isEndSucc(fake) {
				//const key = fake.map(x => x.printFancy()).join(',');
				//console.log("isEndSucc called on", key);

				if (!Array.isArray(fake)) return false;

				if (fake.length < 2) return true;

				const n = fake.length;
				const a = fake[n - 2];
				const b = fake[n - 1];
				return !a.isSucc() && b.isSucc();
			}

			static isCantorTrail(fake) {
				//const key = fake.map(x => x.printFancy()).join(',');
				//console.log("isCantorTrail called on", key);

				if (!Array.isArray(fake) || fake.length === 0) return false;

				const newFake = fake.map((x) => fffz.fullUnnest(x));
				for (let i = 1; i < newFake.length; i++) {
					if (!fffz.isLess(newFake[i], newFake[i - 1])) {
						return false;
					}
				}
				/*
                let logstr = "found chain: "
                for (let i = 0; i < newFake.length; i++) {
                    logstr = logstr + newFake[i].printFancy() + "  ";
                }
                console.log(logstr);
                */
				return true;
			}

			static isUpProj(fake) {
				if (!Array.isArray(fake) || fake.length === 0) return false;

				const isTrueLimit = (x) => {
					if (x.isStrong()) return true;
					const candidate = [...x.fake, x.core];
					return fffz.isCompatible(candidate);
				};

				const allLimit = fake.every((x) => isTrueLimit(x));
				if (allLimit) {
					const coreSeq = fake.map((x) => x.core);
					return fffz.isCompatible(coreSeq);
				}

				const getJudge = (x, isLimit) => {
					let judge;
					if (isLimit) {
						judge = x;
					} else {
						judge = x.fake[x.fake.length - 1];
					}
					if (fffz.mode === 'Actual') {
						judge = fffz.fullUnnest(judge);
					}
					return judge;
				};

				const items = fake.map((x) => {
					const isLimit = isTrueLimit(x);
					const judge = getJudge(x, isLimit);
					return { obj: x, isLimit, judge };
				});

				let minJudge = null;
				for (const item of items) {
					if (minJudge === null) {
						minJudge = item.judge;
					} else {
						const cmp = fffz.cmpStrength(item.judge, minJudge);
						if (cmp < 0) {
							minJudge = item.judge;
						} else if (cmp === 0) {
							const valCmp = fffz.compare(item.judge, minJudge);
							if (valCmp < 0) {
								minJudge = item.judge;
							}
						}
					}
				}

				const isStrictlyStronger = (a, b) => {
					let aa = a;
					let bb = b;
					if (fffz.mode === 'Actual') {
						aa = fffz.fullUnnest(aa);
						bb = fffz.fullUnnest(bb);
					}
					const cmp = fffz.cmpStrength(aa, bb);
					if (cmp > 0) return true;
					if (cmp === 0 && fffz.compare(aa, bb) > 0) return true;
					return false;
				};

				const newSeq = items.map((item) => {
					const isLimit = item.isLimit;
					if (isLimit) {
						if (isStrictlyStronger(minJudge, item.obj.core)) {
							return item.obj.core;
						} else {
							return item.obj;
						}
					} else {
						const cmp = fffz.cmpStrength(item.judge, minJudge);
						if (cmp === 0 && fffz.compare(item.judge, minJudge) === 0) {
							return item.obj.core;
						} else {
							return item.obj;
						}
					}
				});

				let identical = true;
				for (let i = 0; i < newSeq.length; i++) {
					if (!fffz.equals(newSeq[i], fake[i])) {
						identical = false;
						break;
					}
				}
				if (identical) return false;

				return fffz.isCompatible(newSeq);
			}

			static isDownProj(fake) {
				if (!Array.isArray(fake) || fake.length < 2) return false;

				for (let i = 0; i < fake.length - 1; i++) {
					const prev = fake[i];
					const next = fake[i + 1];
					if (fffz.cmpStrength(prev, next) !== 1) return false;
					if (fffz.mode === 'Actual' && prev.core.isSucc()) return false;
				}
				return true;
			}

			static isTranslate(fake) {
				//const key = fake.map(x => x.printFancy()).join(',');
				//console.log("isTranslate called on", key);

				if (!Array.isArray(fake) || fake.length < 3) return false;

				const n = fake.length;
				const last = fake[n - 1];
				for (let i = n - 3; i >= 0; i--) {
					if (fffz.cmpStrength(fake[i], last) < 0) break;

					const prefix = fake.slice(0, i + 2);
					if (!fffz.isCompatible(prefix)) {
						continue;
					}

					const left = fake[i];

					const newFake = [];
					for (let j = i + 1; j < n; j++) {
						const transformed = fffz.fullPeel(left, fake[j]);
						newFake.push(transformed);
					}
					if (fffz.isCompatible(newFake)) {
						/*
                        let logstr = "";
                        for (let k = 0; k < fake.length; k++) {
                            logstr = logstr + fake[k].printFancy() + "  ";
                        }
                        let newstr = "";
                        for (let k = 0; k < newFake.length; k++) {
                            newstr = newstr + newFake[k].printFancy() + "  ";
                        }
                        console.log(logstr + "translate from", i + 1, "as", newstr);
                        */
						return true;
					}
				}
				return false;
			}

			static compatCache = new Map();

			static normalizeFake(fake) {
				if (!Array.isArray(fake) || fake.length === 0) return fake;
				const result = [];
				for (let i = 0; i < fake.length; i++) {
					let cur = fake[i];
					if (i === 0) {
						cur = fffz.fullUnnest(cur);
					} else {
						const prev = result[i - 1];
						while (true) {
							const next = fffz.unnest(cur);
							if (next.isZero || fffz.isLess(next, prev)) {
								break;
							}
							cur = next;
						}
					}
					result.push(cur);
				}
				return result;
			}

			static isCompatibleRaw(fake) {
				const key = fffz.mode + ' ' + fake.map((x) => x.printNat()).join(',');
				if (fffz.compatCache?.has(key)) {
					//console.log("compat cache hit:", key);
					return fffz.compatCache.get(key);
				}

				let result = false;
				if (!Array.isArray(fake)) result = false;
				else if (fake.length === 0) result = true;
				else if (fake.some((x) => x.isZero)) result = false;
				else if (fake.length === 1) result = true;
				else if (!fffz.isNonDouble(fake)) result = false;
				else if (!fffz.isNonRepel(fake)) result = false;
				else if (fffz.isEndSucc(fake)) result = true;
				else if (fffz.isCantorTrail(fake)) result = true;
				else if (fffz.isUpProj(fake)) result = true;
				else if (fffz.isDownProj(fake)) result = true;
				else if (fffz.isTranslate(fake)) result = true;
				else result = false;

				if (!fffz.compatCache) fffz.compatCache = new Map();
				fffz.compatCache.set(key, result);
				console.log('new sequence:', key, 'result:', result);
				return result;
			}

			static isCompatible(fake) {
				const normalized = fffz.normalizeFake(fake);
				return fffz.isCompatibleRaw(normalized);
			}

			expand(n) {
				if (!Number.isInteger(n) || n <= 0) {
					throw new Error('expand: n must be a positive integer');
				}

				if (this.fake.length > 0 && !fffz.isBounded(this.fake)) {
					throw new Error('expand: fake is not bounded');
				}

				if (this.fake.length > 0) {
					const last = this.fake[this.fake.length - 1];
					const bound = new fffz(this.fake.slice(0, -1), last, false);
					if (fffz.isLess(this.core, last) || fffz.isLess(bound, this.core)) {
						throw new Error('expand: core is not bounded');
					}
				}

				if (!fffz.isCompatible(this.fake)) {
					throw new Error('expand: expand called on incompatible fake');
				}

				//const key = this.printFancy();
				//console.log("expand called on", key);

				if (this.isZero) return this;

				if (this.isSucc()) return this.prev();

				const newFake = [...this.fake, this.core];

				if (!fffz.isCompatible(newFake)) {
					//console.log("non-compatible");

					let fake2 = [...this.fake];
					if (fake2.length > 0 && fffz.equals(fake2[fake2.length - 1], this.core)) {
						fake2.pop();
					}

					let k = 0;
					if (fake2.length > 0) {
						const last = fake2[fake2.length - 1];
						let candidate = 1;
						while (true) {
							const expanded = this.core.expand(candidate);
							if (fffz.isLess(expanded, last)) {
								k = candidate;
								candidate++;
							} else {
								break;
							}
						}
					}

					return new fffz(fake2, this.core.expand(n + k), false);
				}

				//console.log("compatible");

				let ref = new fffz(newFake, this.core, false);

				let cur = ref;

				for (let i = 1; i < n; i++) {
					cur = new fffz(ref.fake, cur, false);
				}

				return cur;
			}

			printStr() {
				if (this.isZero) return '0';

				const fakeStr = this.fake.map((x) => x.printStr()).join(',');

				const coreStr = this.core.printStr();

				return `Z[${fakeStr}](${coreStr})`;
			}

			static readStr(str) {
				let i = 0;

				function skip() {
					while (i < str.length && /\s/.test(str[i])) i++;
				}

				function parse() {
					skip();

					if (str[i] === '0') {
						i++;
						return fffz.zero();
					}

					if (str[i] !== 'Z') {
						throw new Error('parse: Expected Z or 0 at position ' + i);
					}
					i++;

					if (str[i] !== '[') throw new Error('parse: Expected [ at ' + i);
					i++;

					let fake = [];
					skip();

					if (str[i] !== ']') {
						while (true) {
							let item = parse();
							fake.push(item);

							skip();
							if (str[i] === ',') {
								i++;
								continue;
							}
							break;
						}
					}

					if (str[i] !== ']') throw new Error('parse: Expected ] at ' + i);
					i++;

					if (str[i] !== '(') throw new Error('parse: Expected ( at ' + i);
					i++;

					let core = parse();

					if (str[i] !== ')') throw new Error('parse: Expected ) at ' + i);
					i++;

					return new fffz(fake, core, false);
				}

				const result = parse();

				skip();
				if (i !== str.length) {
					throw new Error('parse: Unexpected trailing characters at ' + i);
				}

				return result;
			}

			printNat() {
				if (this.isZero) return '0';

				let count = 0;
				let cur = this;

				while (true) {
					if (cur.fake.length === 0 && cur.core.isZero) {
						count += 1;
						return String(count);
					}

					if (
						cur.fake.length === 1 &&
						cur.fake[0].fake.length === 0 &&
						cur.fake[0].core.isZero
					) {
						count += 1;
						cur = cur.core;
						continue;
					}

					break;
				}

				const arr = [...this.fake, this.core];

				const inner = arr.map((x) => x.printNat()).join(',');

				return `Z[${inner}]`;
			}

			static omega = new fffz([], new fffz([], fffz.zero(), false), false);
			static epZero = new fffz([], fffz.omega, false);

			static fffzToOrdinalCache = new Map();
			static ordinalToFffzCache = new Map();

			static fffzToOrdinal(ff) {
				const key = fffz.mode + ' ' + ff.printNat();
				if (fffz.fffzToOrdinalCache.has(key)) {
					return fffz.fffzToOrdinalCache.get(key);
				}

				const isNatural = (x) => {
					if (x.isZero) return { isNat: true, value: 0 };
					let cur = x;
					let count = 0;
					while (true) {
						if (cur.fake.length === 0 && cur.core.isZero) {
							count += 1;
							return { isNat: true, value: count };
						}
						if (
							cur.fake.length === 1 &&
							cur.fake[0].fake.length === 0 &&
							cur.fake[0].core.isZero
						) {
							count += 1;
							cur = cur.core;
							continue;
						}
						break;
					}
					return { isNat: false };
				};

				if (!fffz.isLess(ff, fffz.epZero)) {
					fffz.fffzToOrdinalCache.set(key, null);
					return null;
				}

				let cur = ff;
				let ord = Ordinal.zero();

				while (true) {
					const natInfo = isNatural(cur);
					if (natInfo.isNat) {
						ord = Ordinal.add(ord, Ordinal.fromNat(natInfo.value));
						break;
					}
					//console.log("to ordinal:", ff.printNat());
					const virt = fffz.getVirtual(cur);
					//console.log("virtual:", virt.printNat());
					const lastFake = virt.fake[virt.fake.length - 1];
					const prevLast = lastFake.prev();
					//console.log("prevLast:", prevLast.printNat());
					const aOrd = fffz.fffzToOrdinal(prevLast);
					if (aOrd === null) {
						fffz.fffzToOrdinalCache.set(key, null);
						return null;
					}
					ord = Ordinal.add(ord, new Ordinal([[aOrd, 1]]));
					let peelFake = null;
					let curLength = cur.fake.length;
					if (curLength > 0) {
						peelFake = cur.fake[cur.fake.length - 1];
					}
					cur = fffz.unnest(cur);
					if (cur.isZero) break;
					if (curLength > 0) {
						//console.log("peel", peelFake.prev().printFancy(), "from", cur.printFancy());
						cur = fffz.fullPeel(peelFake.prev(), cur);
					}
				}
				fffz.fffzToOrdinalCache.set(key, ord);
				return ord;
			}

			printFancy() {
				if (this.isZero) return '0';

				if (fffz.equals(this, fffz.epZero)) return 'ε_0';
				if (fffz.isLess(this, fffz.epZero)) {
					const ord = fffz.fffzToOrdinal(this);
					if (ord !== null) {
						return Ordinal.printStr(ord);
					}
				}

				const arr = [...this.fake, this.core];
				const inner = arr.map((x) => x.printFancy()).join(',');
				return `Z[${inner}]`;
			}

			static buildNat(n) {
				if (n === 0) return fffz.zero();
				let one = new fffz([], fffz.zero(), false);
				let cur = one;
				for (let k = 2; k <= n; k++) {
					cur = new fffz([one], cur, false);
				}
				return cur;
			}

			static ordinalToFffz(ord) {
				const key = fffz.mode + ' ' + Ordinal.printStr(ord);
				if (fffz.ordinalToFffzCache.has(key)) {
					return fffz.ordinalToFffzCache.get(key);
				}

				if (ord.isZero()) {
					fffz.ordinalToFffzCache.set(key, fffz.zero());
					return fffz.zero();
				}

				if (ord.terms.length === 1 && ord.terms[0][0].isZero()) {
					const n = ord.terms[0][1];
					fffz.ordinalToFffzCache.set(key, fffz.buildNat(n));
					return fffz.buildNat(n);
				}
				const [exp, coeff] = ord.terms[0];
				const expSucc = Ordinal.add(exp, Ordinal.fromNat(1));

				const omegaOrd = Ordinal.omega();

				if (ord.terms.length === 1 && coeff === 1) {
					const aFffz = fffz.ordinalToFffz(exp);
					const omegaOrd = Ordinal.omega();
					if (Ordinal.compare(exp, omegaOrd) >= 0) {
						fffz.ordinalToFffzCache.set(key, new fffz([fffz.omega], aFffz, false));
						return new fffz([fffz.omega], aFffz, false);
					} else {
						fffz.ordinalToFffzCache.set(key, new fffz([], aFffz, false));
						return new fffz([], aFffz, false);
					}
				}

				let rest;
				if (coeff > 1) {
					const restTerms = [[exp, coeff - 1], ...ord.terms.slice(1)];
					rest = new Ordinal(restTerms);
				} else {
					rest = new Ordinal(ord.terms.slice(1));
				}
				let coreFffz = fffz.ordinalToFffz(rest);
				const fakeItem = fffz.ordinalToFffz(expSucc);

				let fakeArray;
				if (Ordinal.compare(expSucc, omegaOrd) >= 0) {
					fakeArray = [fffz.omega, fakeItem];
				} else {
					fakeArray = [fakeItem];
				}
				const lastFake = fakeArray[fakeArray.length - 1];
				coreFffz = fffz.add(lastFake.prev(), coreFffz);
				//console.log(lastFake.prev().printNat());
				fffz.ordinalToFffzCache.set(key, new fffz(fakeArray, coreFffz, false));
				return new fffz(fakeArray, coreFffz, false);
			}

			static readFancy(str) {
				str = str
					.replace(/z/g, 'Z')
					.replace(/w/g, 'ω')
					.replace(/e/g, 'ε')
					.replace(/×/g, '*')
					.replace(/p/g, '')
					.replace(/ψ/g, '');

				if (str === 'ε_0' || str === 'ε0') {
					return fffz.epZero;
				}

				try {
					const ord = Ordinal.readStr(str);
					return fffz.ordinalToFffz(ord);
				} catch (e) {
					let i = 0;
					const n = str.length;

					function skip() {
						while (i < n && /\s/.test(str[i])) i++;
					}

					function parseElement() {
						skip();
						if (str[i] === 'Z') {
							return parseZ();
						} else {
							if (str.substr(i, 3) === 'ε_0' || str.substr(i, 2) === 'ε0') {
								const len = str.substr(i, 3) === 'ε_0' ? 3 : 2;
								i += len;
								return fffz.epZero;
							}

							let start = i;
							let depth = 0;
							while (i < n) {
								const ch = str[i];
								if (ch === '(' || ch === '[') depth++;
								else if (ch === ')' || ch === ']') {
									if (depth === 0) break;
									depth--;
								} else if (
									(ch === ',' || ch === ']' || ch === ')') &&
									depth === 0
								) {
									break;
								}
								i++;
							}
							const sub = str.slice(start, i);
							try {
								const ord = Ordinal.readStr(sub);
								return fffz.ordinalToFffz(ord);
							} catch (err) {
								throw new Error(
									`parse: Invalid ordinal expression: "${sub}" at position ${start}`,
								);
							}
						}
					}

					function parseZ() {
						if (str[i] !== 'Z') throw new Error('Expected Z at ' + i);
						i++;
						skip();
						let fake = [];
						let core = null;

						if (str[i] === '[') {
							i++;
							let arr = [];
							skip();
							if (str[i] !== ']') {
								while (true) {
									let item = parseElement();
									arr.push(item);
									skip();
									if (str[i] === ',') {
										i++;
										continue;
									}
									break;
								}
							}
							if (str[i] !== ']') throw new Error('Expected ] at ' + i);
							i++;
							skip();
							if (str[i] === '(') {
								i++;
								core = parseElement();
								skip();
								if (str[i] !== ')') throw new Error('Expected ) at ' + i);
								i++;
								fake = arr;
							} else {
								if (arr.length === 0)
									throw new Error('Z[] is invalid (missing core)');
								fake = arr.slice(0, -1);
								core = arr[arr.length - 1];
							}
						} else if (str[i] === '(') {
							i++;
							core = parseElement();
							skip();
							if (str[i] !== ')') throw new Error('Expected ) at ' + i);
							i++;
							fake = [];
						} else {
							throw new Error('Expected [ or ( after Z at ' + i);
						}

						return new fffz(fake, core, false);
					}

					const result = parseZ();
					skip();
					if (i !== n) {
						throw new Error('parse: Unexpected trailing characters at ' + i);
					}
					return result;
				}
			}

			printLatex() {
				if (this.isZero) return '0';

				if (fffz.equals(this, fffz.epZero)) return '\\varepsilon_0';
				if (fffz.isLess(this, fffz.epZero)) {
					const ord = fffz.fffzToOrdinal(this);
					if (ord !== null) {
						return Ordinal.printLatex(ord);
					}
				}

				const arr = [...this.fake, this.core];
				const inner = arr.map((x) => x.printLatex());
				if (inner.length == 1) {
					return `\\psi_Z(${inner[0]})`;
				}
				let res = '\\psi_Z[';
				for (let i = 0; i < inner.length - 1; i++) {
					res += inner[i];
					if (i + 1 != inner.length - 1) {
						res += ',';
					}
				}
				res += ']';
				res += `(${inner.at(-1)})`;
				return res;
			}

			printpsiZ(mode2 = 0) {
				if (this.isZero) return '0';

				if (fffz.equals(this, fffz.epZero)) return 'ε_0';
				if (fffz.isLess(this, fffz.epZero)) {
					const ord = fffz.fffzToOrdinal(this);
					if (ord !== null) {
						return Ordinal.printStr(ord);
					}
				}

				const arr = [...this.fake, this.core];

				const inner = arr.map((x) => x.printpsiZ());

				// const dataset2 = s[mode2 == 1 ? 'fffz0052strong2' : 'fffz0052'];
				// const inner = arr.map((x) => {
				// 	let fancy2 = x.printFancy();
				// 	return dataset2[fancy2] && dataset2[fancy2] !== '???'
				// 		? dataset2[fancy2]
				// 		: x.printpsiZ(mode2);
				// });
				if (inner.length == 1) {
					return `ψZ(${inner[0]})`;
				}
				let res = 'ψZ[';
				for (let i = 0; i < inner.length - 1; i++) {
					res += inner[i];
					if (i + 1 != inner.length - 1) {
						res += ',';
					}
				}
				res += ']';
				res += `(${inner.at(-1)})`;
				return res;
			}
		}
		return { Ordinal, fffz };
	}
	const actual = dwaFFFZ('Actual');
	const strong = dwaFFFZ('Strong');

	function selector(t) {
		if (t == 0) return actual.fffz;
		if (t == 1) return strong.fffz;
		throw new Error('Type not defined');
	}

	function display(w, t = 0) {
		if ('' + w == Infinity) return 'Limit';
		return selector(t).readFancy(w).printpsiZ(t);
	}

	function Limit(FSterm) {
		return 'Z['.repeat(FSterm + 1) + '0' + ']'.repeat(FSterm + 1);
	}
	function isLimit(fff2, t = 0) {
		if ('' + fff2 == Infinity) return true;
		let fff = selector(t).readFancy(fff2);
		if (fff.isZero) return false;
		return !fff.isSucc();
	}

	function compare(x, y, t = 0) {
		if ('' + x == 'Infinity' && !('' + y == 'Infinity')) return 1;
		if (!('' + x == 'Infinity') && '' + y == 'Infinity') return -1;
		if ('' + x == 'Infinity' && '' + y == 'Infinity') return 0;
		let [x2, y2] = [selector(t).readFancy(x), selector(t).readFancy(y)];
		return selector(t).compare(x2, y2);
	}

	function expand(m, FSterm, alternative = false, t = 0) {
		if ('' + m == 'Infinity') return Limit(FSterm);
		return selector(t)
			.readFancy(m)
			.expand(FSterm + 1)
			.printFancy();
	}

	register.push({
		id: 'fffz0052',
		name: 'Fake Fake Fake Zeta Actual',
		display,
		able: isLimit,
		compare,
		FS: (m, FSterm) => {
			if ('' + m === 'Infinity') return Limit(FSterm);
			if (m.isZero) return actual.readFancy('0');
			return expand(m, FSterm, false);
		},
		FSalter: (m, FSterm) => {
			if ('' + m === 'Infinity') return Limit(FSterm);
			if (m.isZero) return '0';
			return expand(m, FSterm, true);
		},
		init: () => [
			{
				expr: [Infinity],
				low: ['0'],
				subitems: [],
				anal: ['all the baixiedies belong to me'],
			},
			{ expr: '0', low: ['0'], subitems: [], anal: ['0'] },
		],
		semiable: (z) => {
			return !z.isZero;
		},
	});
	register.push({
		id: 'fffz0052strong2',
		name: 'Fake Fake Fake Zeta Strong',
		display: (w) => display(w, 1),
		able: isLimit,
		compare,
		FS: (m, FSterm) => {
			if ('' + m === 'Infinity') return Limit(FSterm);
			if (m.isZero) return strong.readFancy('0');
			return expand(m, FSterm, false, 1);
		},
		FSalter: (m, FSterm) => {
			if ('' + m === 'Infinity') return Limit(FSterm);
			if (m.isZero) return '0';
			return expand(m, FSterm, true, 1);
		},
		init: () => [
			{
				expr: [Infinity],
				low: ['0'],
				subitems: [],
				anal: ['all the baixiedies belong to me'],
			},
			{ expr: '0', low: ['0'], subitems: [], anal: ['0'] },
		],
		semiable: (z) => {
			return !z.isZero;
		},
	});
})();
