/************************************************************************************************************
 *
 * @ Version 1.0.3
 * @ Formula Parser
 * @ Date 03. 17. 2016
 * @ Author PIGNOSE
 * @ Licensed under MIT.
 *
 ***********************************************************************************************************/

function formulaComposer(formula) {
	this.formula = formula;
	this.primaryPriority = ['*', 'x', '/', '%'];
	this.secondaryPriority = ['+', '-', '&'];
	this.permittedOperators = ['+', '-', '*', 'x', '/'];
	this.permittedLetters = ['(', ')'].concat(this.permittedOperators);
	return this.init();
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

formulaComposer.prototype.layerParser = function(data, depth) {
	var lastDepth = null;
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
						var result = this.search(_data, depth + 1);
						if(result.result === false) {
							return result;
						} else {
							data.splice(idx, key - idx + 1, result.data);
							lastDepth = result.depth;
						}
						idx--;
						break;
					}
				} 

				if(data.length == key + 1) {
					return {
						result: false,
						col: key,
						stack: 'layerParser',
						msg: "The bracket isn't closed"
					};
				}
			}
		} else if(item == ')') {
			return {
				result: false,
				col: idx,
				stack: 'layerParser',
				msg: "The bracket isn't opened"
			};
		}
	}
	return {
		result: true,
		depth: lastDepth || depth
	};
};

formulaComposer.prototype.syntaxParser = function(data, depth, priority, lastDepth) {
	if((data.length < 3 && lastDepth <= 1) || (lastDepth == 1 && data.length < 1)) {
		return {
			result: false,
			col: 0,
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
						col: idx,
						stack: 'syntaxParser',
						msg: "'" + item + "' mark is not supported."
					};
				}
				if(this.inArray(item, priority) != -1) {
					if(!this.isOperand(data[idx - 1])) {
						return {
							result: false,
							col: idx - 1,
							stack: 'syntaxParser',
							msg: 'Left side operand is not valid.'
						};
					}

					if(!this.isOperand(data[idx + 1])) {
						return {
							result: false,
							col: idx + 1,
							stack: 'syntaxParser',
							msg: 'Right side operand is not valid.'
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
								col: idx - 1,
								stack: 'syntaxParser',
								msg: 'Left side operator is not valid.'
							};
						}
					}

					if(idx + 1 < data.length) {
						if(this.inArray(data[idx + 1], this.permittedOperators) == -1) {
							return {
								result: false,
								col: idx + 1,
								stack: 'syntaxParser',
								msg: 'Right side operator is not valid.'
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

formulaComposer.prototype.search = function(data, depth) {
	if(typeof depth == 'undefined') {
		depth = 1;
	}

	if(typeof data === 'string') {
		data = this.stringToArray(data);
	}

	var result = null;

	result = this.layerParser(data, depth);
	var lastDepth = result.depth;
	if(result.result === false) {
		return result;
	}

	result = this.syntaxParser(data, depth, this.primaryPriority, lastDepth);
	if(result.result === false) {
		return result;
	} else {
		data = result.data;
	}

	result = this.syntaxParser(data, depth, this.secondaryPriority, lastDepth);
	if(result.result === false) {
		return result;
	} else {
		data = result.data;
	}

	return {
		result: true,
		data: data,
		depth: lastDepth
	};
};

formulaComposer.prototype.init = function() {
	return this.search(this.formula);
};