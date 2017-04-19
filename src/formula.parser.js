var FormulaParser = (function () {
    var _PLUGIN_VERSION_ = '2.0.10';

    function FormulaParser(formula) {
        var idx;
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
        for (idx in this.OperandToken) {
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
            'Initializer',
            'LayerParser',
            'SyntaxParser',
            'FilterParser',
            'StringParser'
        ];

        this.ParserMap = {};

        for (idx in this.Parsers) {
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
        this.Message[0x20] = 'Operator\'s key must be in data.';
        this.Message[0x21] = 'Left operand\'s key must be in data.';
        this.Message[0x22] = 'Right operand\'s key must be in data.';
        this.Message[0xA0] = 'Formula expression is null or undefined.';

        /***********************************************
         *
         * @ Start to parsing.
         *
         **********************************************/

        return this.init();
    }

    /**
     * This method retuns current version. (This isn't prototype function.)
     * @namespace FormulaParser
     * @method getVersion
     * @returns {Number}
     */
    FormulaParser.getVersion = function () {
        return _PLUGIN_VERSION_;
    };

    /**
     * When item is in the array, This will returns true.
     * @namespace FormulaParser
     * @method inArray
     * @param {Any} item condition parameter
     * @param {Array} array base target parameter
     * @returns {bool}
     */
    FormulaParser.prototype.inArray = function (item, array) {
        for (var idx in array) if (array[idx] === item) return idx;
        return -1;
    };

    /**
     * When item is operand type(number, object), This will returns true.
     * @namespace FormulaParser
     * @method isOperand
     * @param {Dynamic} item
     * @returns {bool} When parameter is operand type, This function will returuns true.
     */
    FormulaParser.prototype.isOperand = function (item) {
        return typeof item === 'object' || this.isNumeric(item);
    };

    /**
     * Get operator string to priority number.
     * @namespace FormulaParser
     * @method getOperatorPriority
     * @param {String} operator
     * @returns {Number}
     */
    FormulaParser.prototype.getOperatorPriority = function (operator) {
        if (this.inArray(operator, this.Operators) === -1) {
            return -1;
        } else {
            var priority = -1;
            for (var idx = 0; idx < this.OperandPriority.length; idx++) {
                if (this.inArray(operator, this.OperandPriority[idx]) !== -1) {
                    priority = idx;
                    break;
                }
            }
            return priority;
        }
    };

    /**
     * When item is number type, This will returns true. The method is part of isOperand.
     * @namespace FormulaParser
     * @method isNumeric
     * @param {Number} n - number
     * @returns {bool} When parameter is numeric this function returns true
     */
    FormulaParser.prototype.isNumeric = function (n) {
        return (/\d+(\.\d*)?|\.\d+/).test(n);
    };

    /**
     * This method can make string type formula to array.
     * @namespace FormulaParser
     * @method stringToArray
     * @param {String} s - formula string
     * @returns {array}
     */
    FormulaParser.prototype.stringToArray = function (s) {
        var data = [];
        var dataSplited = s.split('');
        var dataSplitedLen = dataSplited.length;
        for (var idx = 0; idx < dataSplitedLen; idx++) {
            var item = dataSplited[idx];
            if (this.inArray(item, this.Units) !== -1 || this.isOperand(item) === true) {
                if (idx > 0 && this.isOperand(item) === true && this.isOperand(data[data.length - 1]) === true) {
                    data[data.length - 1] += item.toString();
                } else {
                    data.push(item);
                }
            }
        }
        return data;
    };

    /**
     * Standard logger for formula parser, But this method does not display in console.
     * @namespace FormulaParser
     * @method log
     * @param {Number} code - return code
     * @param {Dynamic} data - return data
     * @param {Array} mapping - return message mapping data
     * @returns {array}
     */
    FormulaParser.prototype.log = function (code, data, mapping) {
        var message = this.Message[code], idx, item;

        for (idx in mapping) {
            item = mapping[idx];
            message = message.replace(new RegExp('\\\{' + idx + '\\\}', 'g'), item);
        }

        var obj = {
            status: code === 0x00,
            code: code,
            msg: message
        };

        if (typeof data !== 'undefined' && data !== null) {
            for (idx in data) {
                item = data[idx];
                if (typeof item !== 'function') {
                    obj[idx] = item;
                }
            }
        }

        return obj;
    };

    /**
     * Layer parser is examination all formula syntax minutely and parsing by search method.
     * @namespace FormulaParser
     * @method layerParser
     * @related search method
     * @param {Array} data - formula array data
     * @param {Number} pos - formula stack cursor
     * @param {Number} depth - formula search depth (start from 0)
     * @returns {Object}
     */
    FormulaParser.prototype.layerParser = function (data, pos, depth) {
        var innerDepth = 0;
        var startPos = [], endPos = [];
        var currentParser = this.ParserMap.LayerParser;
        var totalLength = data.length;

        depth = depth || 0;

        if (data.length === 1 && typeof data[0] !== 'object') {
            return {
                status: true,
                data: data[0],
                length: 1
            };
        }

        for (var idx = 0; idx < data.length; idx++) {
            var item = data[idx];
            if (item === '(') {
                innerDepth++;
                startPos[innerDepth] = idx + 1;
            } else if (item === ')') {
                if (innerDepth < 1) {
                    return this.log(0x05, {
                        stack: currentParser,
                        col: startPos.length > 0 ? startPos[startPos.length - 1] : 0
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
                        if (typeof result.data === 'object' && typeof result.data[0] !== 'object' && result.data.length === 1) {
                            result.data = result.data[0];
                        }
                        data.splice(startPos[innerDepth] - 1, length + 2, result.data);
                        idx -= length + 1;
                    }
                }
                innerDepth--;
            }
        }

        if (innerDepth > 0) {
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

    /**
     * Syntax layer makes formula object from formula expression.
     * @namespace FormulaParser
     * @method syntaxParser
     * @related search method
     * @param {Array} data - formula array data
     * @param {Number} pos - formula stack cursor
     * @param {Number} depth - formula search depth (start from 0)
     * @param {Number} length - compressed formula expression length
     * @param {Array} operators - permitted formula unit array
     * @returns {Object}
     */
    FormulaParser.prototype.syntaxParser = function (data, pos, depth, length, operators) {
        this.currentParser = this.ParserMap.SyntaxParser;

        data = data || [];
        pos = pos || 0;
        depth = depth || 0;

        var cursor = pos;

        if (typeof data[0] !== 'undefined' && data[0] !== null && typeof data[0][0] === 'object' && (typeof data[0].operator === 'undefined' || data[0].operator === null)) {
            data[0] = data[0][0];
        }

        if (data.length < 3) {
            if (data.length <= 1 && typeof data[0] === 'object' && typeof data[0].operator !== 'undefined' && data[0].operator !== null) {
                return data[0];
            } else {
                return this.log(0x01, {
                    stack: this.currentParser,
                    col: pos + (typeof data[0] === 'object' ? data[0].length : 0) + 1
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

                        if (typeof data[idx - 1][0] === 'object') {
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

    /**
     * Filter parser remains the formula object's only useful data for user
     * @namespace FormulaParser
     * @method filterParser
     * @related search method
     * @param {Object} data - formula object
     * @returns {Object}
     */
    FormulaParser.prototype.filterParser = function (data) {
        if (typeof data[0] === 'object') {
            data = data[0];
        }

        if (typeof data.operand1 === 'object') {
            this.filterParser(data.operand1);
        }

        if (typeof data.operand2 === 'object') {
            this.filterParser(data.operand2);
        }

        if (typeof data.length !== 'undefined') {
            delete data.length;
        }

        return data;
    };

    /**
     * String parser is using for convert formula object to readable formula array.
     * @namespace FormulaParser
     * @method stringParser
     * @related collapse method
     * @param {Object} data - formula object
     * @param {Number} depth - formula parse depth
     * @param {Number} pos - formula stack cursor
     * @returns {Array}
     */
    FormulaParser.prototype.stringParser = function (data, depth, pos) {
        this.currentParser = this.ParserMap.StringParser;

        var _this = this;
        var formula = [];

        depth = depth || 0;
        pos = pos || 0;

        if (typeof data.value === 'undefined' || data.value === null) {
            if (typeof data.operator === 'undefined' || data.operator === null) {
                return this.log(0x20, {
                    stack: this.currentParser,
                    col: pos,
                    depth: depth
                });
            } else if (typeof data.operand1 === 'undefined' || data.operand1 === null) {
                return this.log(0x21, {
                    stack: this.currentParser,
                    col: pos,
                    depth: depth
                });
            } else if (typeof data.operand2 === 'undefined' || data.operand2 === null) {
                return this.log(0x22, {
                    stack: this.currentParser,
                    col: pos,
                    depth: depth
                });
            }
        } else {
            return {
                status: true,
                data: ((data.value.type === 'unit') ? data.value.unit : data.value)
            };
        }

        var params = ['operand1', 'operator', 'operand2'];
        for (var idx = 0; idx < params.length; idx++) {
            var param = params[idx];
            if (typeof data[param] === 'object') {
                var result = _this.stringParser(data[param], depth + 1, pos + idx);
                if (result.status === false) {
                    return result;
                } else {
                    formula = formula.concat(result.data);
                    if (typeof data.operator !== 'undefined' && data.operator !== null && typeof result.operator !== 'undefined' && result.operator !== null) {
                        if (this.getOperatorPriority(data.operator) < this.getOperatorPriority(result.operator) && this.getOperatorPriority(data.operator) !== -1) {
                            formula.splice([formula.length - 3], 0, '(');
                            formula.splice([formula.length], 0, ')');
                        }
                    }
                }
            } else {
                formula.push(data[param]);
            }
        }

        return {
            status: true,
            data: formula,
            operator: depth > 0 ? data.operator : undefined
        };
    };

    /**
     * Search method routes each of commands to right steps.
     * @namespace FormulaParser
     * @method search
     * @related layerParser, syntaxParser, filterParser methods.
     * @param {Array} data - formula array data
     * @param {Number} pos - formula stack cursor
     * @param {Number} depth - formula search depth (start from 0)
     * @returns {Object}
     */
    FormulaParser.prototype.search = function (data, pos, depth) {
        var _super = this;
        pos = pos || 0;
        depth = depth || 0;

        if (typeof data === 'string' && depth < 1) {
            data = this.stringToArray(data);
        }

        var result = null;
        var len = this.OperandPriority.length + 1;
        var parserLength = 0;
        var parserComplete = function () {
            if (depth === 0) {
                data = _super.filterParser(data);
            }

            return {
                status: true,
                data: data,
                length: depth === 0 ? undefined : parserLength,
                depth: depth === 0 ? undefined : depth
            };
        };

        for (var i = 0; i < len; i++) {
            if (result !== null && typeof result.data !== 'undefined' && result.data.length === 1) {
                return parserComplete.call();
            }

            if (i === 0) {
                result = this.layerParser(data, pos, depth);
                parserLength = result.length;
            } else {
                result = this.syntaxParser(data, pos, depth, parserLength, this.OperandPriority[i - 1]);
            }

            if (result.status === false) {
                return result;
            } else if (i + 1 === len) {
                return parserComplete.call();
            }
        }
    };

    /**
     * Collapse method can convert formula object to readable and user-friendly formula array.
     * @namespace FormulaParser
     * @method collapse
     * @related stringParser method.
     * @param {Object} data - formula object data
     * @param {Number} depth - formula search depth (start from 0)
     * @returns {Object}
     */
    FormulaParser.prototype.collapse = function (data, depth) {
        var _this = this, formula = null;
        depth = depth || 0;
        formula = this.stringParser(data, depth);

        return {
            status: true,
            data: formula.data
        };
    };

    /**
     * Init method is fired when you declare FormulaParser object by new keyword.
     * @namespace FormulaParser
     * @method init
     * @related FormulaParser object.
     * @returns {Dynamic}
     */
    FormulaParser.prototype.init = function () {
        if (typeof this.formula === 'undefined' || this.formula === null) {
            return this.log(0xA0, {
                stack: this.Parsers.Initializer,
                col: 0
            });
        } else if (typeof this.formula === 'string' || (typeof this.formula === 'object' && (typeof this.formula.operator === 'undefined' || this.formula.operator === null))) {
            return this.search(this.formula);
        } else if (typeof this.formula === 'object' && typeof this.formula.operator !== 'undefined' && this.formula.operator !== null) {
            return this.collapse(this.formula);
        } else {
            console.error('Unkown type formula', this.formula);
        }
    };

    return FormulaParser;
})();