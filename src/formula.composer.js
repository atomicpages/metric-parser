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
}

formulaComposer.prototype.isOperand = function(i) {
	return typeof i === 'object' || this.isNumeric(i);
}

formulaComposer.prototype.isNumeric = function(n) {
	return /\d+(\.\d*)?|\.\d+/.test(n);
}

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
}

formulaComposer.prototype.layerParser = function(data, depth) {
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
					if(innerDepth == 0) {
						var _data = [];
						for(var j = idx + 1; j < key; j++) {
							_data.push(data[j]);
						}
						var result = this.search(_data, depth + 1);
						if(result.result == false) {
							return result;
						} else {
							data.splice(idx, key - idx + 1, result.data)
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
				key: idx,
				stack: 'layerParser',
				msg: "The bracket isn't opened"
			};
		}
	}
	return {
		result: true
	};
}

formulaComposer.prototype.syntaxParser = function(data, depth, priority) {
	if(data.length < 3) {
		return {
			result: false,
			col: 0,
			stack: 'syntaxParser',
			msg: 'Formula must has characters than 3 times'
		}
	}
	for(var idx = 1; idx < data.length - 1; idx++) {
		var item = data[idx];
		if(this.inArray(item, this.permittedOperators) == -1 && !this.isOperand(item)) {
			return {
				result: false,
				col: idx,
				stack: 'syntaxParser',
				msg: "'" + item + "' mark is not supported."
			}
		}
		if(this.inArray(item, priority) != -1) {
			if(!this.isOperand(data[idx - 1])) {
				return {
					result: false,
					col: idx - 1,
					stack: 'syntaxParser'
				};
			}

			if(!this.isOperand(data[idx + 1])) {
				return {
					result: false,
					col: idx + 1,
					stack: 'syntaxParser'
				};
			}

			var o = {
				operator: item,
				operand1: data[idx - 1],
				operand2: data[idx + 1]
			};
			data.splice(idx - 1, 3, o);
			if(data.length == 1 && typeof data[0] === 'object') {
				data = data[0];
			}
			idx--;
		} else {
		}
	}
	return {
		result: true,
		data: data
	};
}

formulaComposer.prototype.search = function(data, depth) {
	if(typeof depth == 'undefined') {
		depth = 1;
	}

	if(typeof data === 'string') {
		data = this.stringToArray(data);
		console.log(data);
	}

	var result = this.layerParser(data, depth);
	if(result.result == false) {
		return result;
	}

	var result = this.syntaxParser(data, depth, this.primaryPriority);
	if(result.result == false) {
		return result;
	} else {
		data = result.data;
	}

	var result = this.syntaxParser(data, depth, this.secondaryPriority);
	if(result.result == false) {
		return result;
	} else {
		data = result.data;
	}

	return {
		result: true,
		data: data
	}
}

formulaComposer.prototype.init = function() {
	return this.search(this.formula);
}