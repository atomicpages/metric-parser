/************************************************************************************************************
 *
 * @ Version 1.0.4
 * @ Formula Parser
 * @ Date 03. 25. 2016
 * @ Author PIGNOSE
 * @ Licensed under MIT.
 *
 ***********************************************************************************************************/

function formulaComposer(formula, encode) {
	this.formula = formula;
	this.primaryPriority = ['*', 'x', '/', '%'];
	this.secondaryPriority = ['+', '-', '&'];
	this.permittedOperators = ['+', '-', '*', 'x', '/'];
	this.permittedLetters = ['(', ')'].concat(this.permittedOperators);
	return this.init(encode);
}

formulaComposer.prototype.getIndex = function(pos, map) {
	return map[pos]? map[pos]:map[map.length - 1];
}

formulaComposer.prototype.inArray = function(i, a) {
	for(var idx in a) if(a[idx] == i) return idx;
	return -1;
};

formulaComposer.prototype.isOperand = function(i) {
	return typeof i === 'object' || this.isNumeric(i);
};

formulaComposer.prototype.isNumeric = function(n) {
	return (/\d+(\.\d*)?|\.\d+/).test(n);
};

formulaComposer.prototype.stringToArray = function(s) {
	var data = [];
	var splited = s.split('');
	for(var idx in splited) {
		var item = splited[idx];
		if(this.inArray(item, this.permittedLetters) == -1 && !this.isOperand(item)) {
			continue;
		} else {
			if(idx > 0 && this.isOperand(item) && this.isOperand(data[data.length - 1])) {
				data[data.length - 1] += item.toString();
			} else {
				data.push(item);
			}
		}
	}
	return data;
};

formulaComposer.prototype.layerParser = function(data, pos, depth, map) {
	var lastDepth = null;
	var curIdx = pos;
	for(var idx = 0; idx < data.length; idx++) {
		var item = data[idx];
		if(item == '(') {
			var innerDepth = 1;
			for(var key = idx + 1; key < data.length; key++) {
				var sub = data[key];
				if(sub == '(') {
					innerDepth++;
				} else if(sub == ')') {
					innerDepth--;
					if(innerDepth === 0) {
						var _data = [];
						for(var j = idx + 1; j < key; j++) {
							_data.push(data[j]);
						}
						var result = this.search(_data, pos + idx + 1, depth + 1);
						if(result.result === false) {
							return result;
						} else {
							data.splice(idx, key - idx + 1, result.data);
							curIdx = key + pos;
							lastDepth = result.depth;
						}
					}
				} 

				if(data.length == key + 1) {
					return {
						result: false,
						col: pos + key,
						stack: 'layerParser',
						msg: "The bracket isn't closed",
						map: map
					};
				}
			}
		} else if(item == ')') {
			return {
				result: false,
				col: pos,
				stack: 'layerParser',
				msg: "The bracket isn't opened",
				map: map
			};
		}
		map.push(curIdx);
		curIdx++;
	}
	return {
		result: true,
		depth: lastDepth || depth,
		map: map
	};
};

formulaComposer.prototype.syntaxParser = function(data, pos, depth, map, priority, lastDepth) {
	if((data.length < 3 && lastDepth <= 1) || (lastDepth == 1 && data.length < 1)) {
		return {
			result: false,
			col: pos,
			stack: 'syntaxParser',
			msg: 'Formula must has characters than 3 times'
		};
	}

	if(typeof data.length !== 'undefined') {
		if(data.length > 1) {
			for(var idx = 0; idx < data.length; idx++) {
				var item = data[idx];
				if(this.inArray(item, this.permittedOperators) == -1 && !this.isOperand(item)) {
					return {
						result: false,
						col: this.getIndex(pos + idx, map),
						stack: 'syntaxParser',
						msg: "'" + item + "' mark is not supported.",
						map: map
					};
				}
				if(this.inArray(item, priority) != -1) {
					if(!this.isOperand(data[idx - 1])) {
						return {
							result: false,
							col: this.getIndex(pos + idx - 1, map),
							stack: 'syntaxParser',
							msg: 'Left side operand is not valid.',
							map: map
						};
					}

					if(!this.isOperand(data[idx + 1])) {
						return {
							result: false,
							col: this.getIndex(pos + idx + 1, map),
							stack: 'syntaxParser',
							msg: 'Right side operand is not valid.',
							map: map
						};
					}

					var o = {
						operator: item,
						operand1: data[idx - 1],
						operand2: data[idx + 1]
					};
					data.splice(idx - 1, 3, o);
					idx--;
				} else if(this.isOperand(data[idx])) {
					if(idx - 1 > 0) {
						if(this.inArray(data[idx - 1], this.permittedOperators) == -1) {
							return {
								result: false,
								col: this.getIndex(pos + idx - 1, map),
								stack: 'syntaxParser',
								msg: 'Left side operator is not valid.',
								map: map
							};
						}
					}

					if(idx + 1 < data.length) {
						if(this.inArray(data[idx + 1], this.permittedOperators) == -1) {
							return {
								result: false,
								col: this.getIndex(pos + idx + 1, map),
								stack: 'syntaxParser',
								msg: 'Right side operator is not valid.',
								map: map
							};
						}
					}
				}
			}
		} else {
			if(lastDepth == 1) {
				return {
					result: true,
					data: {
						operator: '=',
						operand1: data[0]
					}
				};
			}
		}
	}

	if(data.length == 1 && typeof data[0] === 'object') {
		data = data[0];
	}

	return {
		result: true,
		data: data
	};
};

formulaComposer.prototype.formulaParser = function(data, depth) {
	var _this = this;
	var formula = [];
	if(typeof data.operator === 'undefined') {
		return {
			result: false,
			depth: depth,
			col: 'operator unit',
			stack: 'collapse',
			msg: 'operator key must be in data'
		};
	} else if(typeof data.operand1 === 'undefined') {
		return {
			result: false,
			depth: depth,
			col: 'operand1 unit',
			stack: 'collapse',
			msg: 'operand1 key must be in data'
		};
	} else if(typeof data.operand2 === 'undefined') {
		return {
			result: false,
			depth: depth,
			col: 'operand2 unit',
			stack: 'collapse',
			msg: 'operand2 key must be in data'
		};
	}

	var params = ['operand1', 'operator', 'operand2'];
	for(var idx in params) {
		var param = params[idx];
		if(typeof data[param] === 'object') {
			var result = _this.formulaParser(data[param], depth + 1);
			if(result.result == false) {
				return result;
			} else {
				formula = formula.concat(['('].concat(result.data).concat([')']));
			}
		} else {
			formula.push(data[param]);
		}
	}

	return {
		result: true,
		data: formula
	};
}

formulaComposer.prototype.search = function(data, pos, depth, map) {
	if(typeof pos === 'undefined') {
		pos = 0;
	}

	if(typeof depth === 'undefined') {
		depth = 1;
	}
	if(typeof map === 'undefined') {
		map = [];
	}

	if(typeof data === 'string') {
		data = this.stringToArray(data);
	}

	var result = null;

	result = this.layerParser(data, pos, depth, map);
	var lastDepth = result.depth;
	if(result.result === false) {
		return result;
	}

	result = this.syntaxParser(data, pos, depth, result.map, this.primaryPriority, lastDepth);
	if(result.result === false) {
		return result;
	} else {
		data = result.data;
	}

	result = this.syntaxParser(data, pos, depth, result.map, this.secondaryPriority, lastDepth);
	if(result.result === false) {
		return result;
	} else {
		data = result.data;
	}

	return {
		result: true,
		data: data,
		depth: lastDepth,
		map: result.map
	};
};

formulaComposer.prototype.collapse = function(data, depth) {
	var _this = this;
	if(typeof depth === 'undefined') {
		depth = 1;
	}
	var formula = this.formulaParser(data, depth);
	return {
		result: true,
		data: formula.data.join(' ')
	};
}

formulaComposer.prototype.init = function(encode) {
	if(typeof encode === 'undefined' || encode == false) {
		return this.search(this.formula);
	} else {
		return this.collapse(this.formula);
	}
};