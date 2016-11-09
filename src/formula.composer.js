/************************************************************************************************************
 *
 * @ Version 1.1.0
 * @ FormulaParser
 * @ Date 11. 09. 2016
 * @ Author PIGNOSE
 * @ Licensed under MIT.
 *
 ***********************************************************************************************************/

function FormulaParser(formula, encode) {
    this.formula = formula;

    /***********************************************
     *
     * @ Note OperandToken Declaration
     *
     **********************************************/

    this.OperandToken = {};
    this.OperandToken.Addition = ['+'];
    this.OperandToken.Subtraction = ['-'];
    this.OperandToken.Multiplication = ['x', '*'];
    this.OperandToken.Division = ['/'];
    this.OperandToken.Mod = ['%'];
    this.OperandToken.Pow = ['^'];
    this.OperandToken.Bracket = ['(', ')', '[', ']', '{', '}'];

    /***********************************************
     *
     * @ Note Resitration the priority.
     *
     **********************************************/

    this.OperandPriority = [];
    this.OperandPriority[0] = [].concat(this.OperandToken.Mod, this.OperandToken.Pow);
    this.OperandPriority[1] = [].concat(this.OperandToken.Multiplication, this.OperandToken.Division);
    this.OperandPriority[2] = [].concat(this.OperandToken.Addition, this.OperandToken.Subtraction);

    /***********************************************
     *
     * @ Note Resitration operators.
     *
     **********************************************/

    this.Operators = [];
    for(var idx in this.OperandToken) {
    	var item = this.OperandToken[idx];
    	this.Operators = this.Operators.concat(item);	
    }

    /***********************************************
     *
     * @ Note Resitration units.
     *
     **********************************************/

    this.Units = [].concat(this.Operators, this.OperandToken.Bracket);



    /***********************************************
     *
     * @ Note Resitration parsers.
     *
     **********************************************/

    this.Parsers = [
    	'LayerParser',
    	'SyntaxParser'
    ];

    this.ParserMap = {};

    for(var idx in this.Parsers) {
    	var parser = this.Parsers[idx];
    	this.ParserMap[parser] = parser;
    }

    this.Message = {};
    this.Message[0x01] = 'Formula must has characters than {0} times';
    this.Message[0x02] = '\'{0}\' operator is not supported.';
    this.Message[0x03] = 'Left side operand is not valid.';
    this.Message[0x04] = 'Right side operand is not valid.';
    this.Message[0x05] = 'Bracket must be opened.';
    this.Message[0x06] = 'Bracket must be closed.';

    return this.init(encode);
}

FormulaParser.prototype.inArray = function (i, a) {
    for (var idx in a) if (a[idx] === i) return idx;
    return -1;
};

FormulaParser.prototype.isOperand = function (i) {
    return typeof i === 'object' || this.isNumeric(i);
};

FormulaParser.prototype.isNumeric = function (n) {
    return (/\d+(\.\d*)?|\.\d+/).test(n);
};

FormulaParser.prototype.stringToArray = function (s) {
    var data = [];
    var dataSplited = s.split('');
    var dataSplitedLen = dataSplited.length;
    for (var idx=0; idx<dataSplitedLen; idx++) {
        var item = dataSplited[idx];
        if (this.inArray(item, this.Units) === -1 && this.isOperand(item) === false) {
            // continue;
        } else {
            if (idx > 0 && this.isOperand(item) === true && this.isOperand(data[data.length - 1]) === true) {
                data[data.length - 1] += item.toString();
            } else {
                data.push(item);
            }
        }
    }
    return data;
};

FormulaParser.prototype.log = function(code, data, mapping) {
	var message = this.Message[code];

	for(var idx in mapping) {
		var item = mapping[idx];
		message = message.replace(new RegExp('\\\{' + idx + '\\\}', 'g'), item);
	}

	var obj = {
		status: code === 0x00,
		code: code,
		msg: message
	};

	if(typeof data !== 'undefined') {
		for(var idx in data) {
			var item = data[idx];
			if(typeof item !== 'function') {
				obj[idx] = item;
			}
		}
	}

	return obj;
};

FormulaParser.prototype.layerParser = function (data, pos, depth) {
    var depth         = depth || 0;
    var innerDepth    = 0;
    var startPos      = [], endPos = [];
    var currentParser = this.ParserMap.LayerParser;
    var totalLength   = data.length;

    if (data.length === 1 && typeof data[0] !== 'object') {
		return {
			status: true,
			data: data[0],
			length: 1
		};

		return data[0];
	}

    for (var idx = 0; idx < data.length; idx++) {
        var item = data[idx];
        if (item === '(') {
            innerDepth++;
            startPos[innerDepth] = idx + 1;
        } else if (item === ')') {
        	if(innerDepth < 1) {
        		return this.log(0x05, {
    				stack: currentParser,
        			col: startPos.length > 0? startPos[startPos.length - 1]:0
        		});
        	}

            if (innerDepth === 1) {
                var paramData = [];
                endPos[innerDepth] = idx - 1;

                for (var j = startPos[innerDepth]; j <= endPos[innerDepth]; j++) {
                    paramData.push(data[j]);
                }

                var result = this.search(paramData, pos + startPos[innerDepth] + 1, depth + 1);

                if (result.status === false) {
                    return result;
                } else {
                	var length = result.length;
                	if(typeof result.data === 'object' && typeof result.data[0] !== 'object' && result.data.length === 1) {
                		result.data = result.data[0];
                	}
                    data.splice(startPos[innerDepth] - 1, length + 2, result.data);
                    idx -= length + 1;
                }
            }
            innerDepth--;
        }
    }

    if(innerDepth > 0) {
    	return this.log(0x06, {
    		stack: currentParser,
    		col: data.length || -1
    	});
    }

    return {
        status: true,
        depth: depth,
        length: totalLength || -1
    };
};

FormulaParser.prototype.syntaxParser = function (data, pos, depth, length, operators) {
	this.currentParser = this.ParserMap.SyntaxParser;

	data  = data  || [];
	pos   = pos   || 0;
	depth = depth || 0;

	var cursor = pos;

	if(typeof data[0][0] === 'object' && typeof data[0].operator === 'undefined') {
		data[0] = data[0][0];
	}

	if (data.length < 3) {
		if(data.length < 1 && typeof data[0] === 'object' && typeof data[0].operator !== 'undefined') {
			return data[0];
		} else {
	        return this.log(0x01, {
	            stack: this.currentParser,
	            col: pos + (typeof data[0] === 'object'? data[0].length:0) + 1
	        }, [3]);
	    }
    }

    if (typeof data.length !== 'undefined') {
        if (data.length > 1) {
            for (var idx = 0; idx < data.length; idx++) {
            	cursor = idx + pos;
                var item = data[idx];
                if (this.inArray(item, this.Operators) === -1 && this.isOperand(item) === false) {
			        return this.log(0x02, {
			            stack: this.currentParser,
			            col: cursor
			        }, [item]);
                }

                if (this.inArray(item, operators) !== -1) {
                    if (this.isOperand(data[idx - 1]) === false) {
				        return this.log(0x03, {
				            stack: this.currentParser,
				            col: cursor - 1
				        });
                    }

                    if (this.isOperand(data[idx + 1]) === false) {
				        return this.log(0x04, {
				            stack: this.currentParser,
				            col: cursor + 1
				        });
                    }

                    data.splice(idx - 1, 3, {
                        operator: item,
                        operand1: data[idx - 1],
                        operand2: data[idx + 1],
                        length: length
                    });

                   	if(typeof data[idx - 1][0] === 'object') {
                   		data[idx - 1] = data[idx - 1][0];
                   	}

                    idx--;
                }
            }
        }
    }

    return {
        status: true,
        data: data
    };
};

FormulaParser.prototype.filterLayer = function(data) {
	if(typeof data[0] === 'object') {
		data = data[0];
	}

	if(typeof data.operand1 === 'object') {
		this.filterLayer(data.operand1);
	}

	if(typeof data.operand2 === 'object') {
		this.filterLayer(data.operand2);
	}

	if(typeof data.length !== 'undefined') {
		delete data.length;
	}

	return data;
}

FormulaParser.prototype.formulaParser = function (data, depth) {
    var _this = this;
    var formula = [];
    if (typeof data.value === 'undefined') {
        if (typeof data.operator === 'undefined') {
            return {
                status: false,
                depth: depth,
                col: 'operator unit',
                stack: 'collapse',
                msg: 'operator key must be in data'
            };
        } else if (typeof data.operand1 === 'undefined') {
            return {
                status: false,
                depth: depth,
                col: 'operand1 unit',
                stack: 'collapse',
                msg: 'operand1 key must be in data'
            };
        } else if (typeof data.operand2 === 'undefined') {
            return {
                status: false,
                depth: depth,
                col: 'operand2 unit',
                stack: 'collapse',
                msg: 'operand2 key must be in data'
            };
        }
    } else {
        return {
            status: true,
            data: ((data.value.type === 'unit') ? data.value.unit : data.value)
        };
    }

    var params = ['operand1', 'operator', 'operand2'];
    for (var idx in params) {
        var param = params[idx];
        if (typeof data[param] === 'object') {
            var result = _this.formulaParser(data[param], depth + 1);
            if (result.status === false) {
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
};

FormulaParser.prototype.search = function (data, pos, depth) {
	var _super = this;
    pos   = pos   || 0;
    depth = depth || 0;

    if (typeof data === 'string' && depth < 1) {
        data = this.stringToArray(data);
    }

    var result = null;
    var len = this.OperandPriority.length + 1;
    var parserLength = 0;
    var parserComplete = function() {
    	if(depth === 0) {
    		data = _super.filterLayer(data);
    	}

    	return {
	        status: true,
	        data: data,
	        length: depth === 0? undefined:parserLength,
	        depth:  depth === 0? undefined:depth
	    };
    }

    for(var i=0; i<len; i++) {
    	if(result !== null && typeof result.data !== 'undefined' && result.data.length === 1) {
	    	return parserComplete.call();
    	}

    	if(i === 0) {
    		result = this.layerParser(data, pos, depth);
    		parserLength = result.length;
    	} else {
    		result = this.syntaxParser(data, pos, depth, parserLength, this.OperandPriority[i - 1]);
    	}

	    if (result.status === false) {
	        return result;
	    } else if(i + 1 === len) {
	    	return parserComplete.call();
	    }
    }
};

FormulaParser.prototype.collapse = function (data, depth) {
    var _this = this;
    if (typeof depth === 'undefined') {
        depth = 1;
    }
    var formula = this.formulaParser(data, depth);
    return {
        status: true,
        data: formula.data
    };
};

FormulaParser.prototype.init = function (encode) {
    if (typeof encode === 'undefined' || encode === false) {
        return this.search(this.formula);
    } else {
        return this.collapse(this.formula);
    }
};