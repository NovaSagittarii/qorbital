(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return (root.FastTrig = factory());
        });
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.FastTrig = factory();
    }
}(this, function () {
    var PI2 = Math.PI * 2;

    FastTrig.DEFAULT_PARAMS = {
        resolution: 360,
        minAtan: -40,
        maxAtan: 40
    };
    
    function FastTrig (params) {
        this.params = FastTrig._assign(null, FastTrig.DEFAULT_PARAMS, params);
        FastTrig._setDefaultValues(this.params);

        this.cosTable = new Float32Array(this.params.nbCos);
        this.cosFactor = this.params.nbCos / PI2;
        FastTrig._fillCache(this.cosTable, this.cosFactor, Math.cos);

        this.sinTable = new Float32Array(this.params.nbSin);
        this.sinFactor = this.params.nbSin / PI2;
        FastTrig._fillCache(this.sinTable, this.sinFactor, Math.sin);

        this.atanTable = new Float32Array(this.params.nbAtan);
        this.atanFactor = this.params.nbAtan / (this.params.maxAtan - this.params.minAtan)
        FastTrig._fillAtanCache(this.atanTable, this.atanFactor, this.params.minAtan);
    };

    FastTrig.prototype.cos = function (angle) {
        angle %= PI2;
        if (angle < 0) angle += PI2;
        return this.cosTable[(angle * this.cosFactor) | 0];
    };
    FastTrig.prototype.sin = function (angle) {
        angle %= PI2;
        if (angle < 0) angle += PI2;
        return this.sinTable[(angle * this.sinFactor) | 0];
    };
    FastTrig.prototype.atan = function (tan) {
        var index = ((tan - this.params.minAtan) * this.atanFactor) | 0;
        if (index < 0) {
            return - Math.PI / 2;
        } else if (index >= this.params.nbAtan) {
            return Math.PI / 2;
        }
        return this.atanTable[index];
    };
    // What we learned in Math 3 Honors
    FastTrig.prototype.atan2 = function (y, x) {
        if (x > 0.0) {
            if (y === 0.0) return y;
            if (x === Number.POSITIVE_INFINITY) return FastTrig._quadDef(y);
            else return this.atan(y / x);
        } else if (x < 0.0) {
            if (y === 0.0) return Math.PI * Math.sign(y);

            if (x === Number.NEGATIVE_INFINITY) return FastTrig._quadDef(y);
            else if (y > 0.0) return Math.PI/2 - this.atan(x / y);
            else if (y < 0.0) return -Math.PI/2 - this.atan(x / y);
            else return Number.NaN;
        } else return FastTrig._quadDefZeroOrNan(y, x);
    };

    FastTrig._quadDef = function (y) {
        if (y === Number.POSITIVE_INFINITY) {
            return 3*Math.PI/4;
        } else if (y === Number.NEGATIVE_INFINITY) {
            return -3*Math.PI/4;
        } else if (y > 0.0) {
            return Math.PI;
        } else if (y < 0.0) {
            return -Math.PI;
        } else {
            return Number.NaN;
        }
    };

    FastTrig._quadDefZeroOrNan = function (y, x) {
        if (x === 0.0) {
            if (y === 0.0) {
                if (Math.sign(x) < 0) {
                    // x is -0.0
                    return Math.sign(y) * Math.PI;
                } else {
                    // +-0.0
                    return y;
                }
            }
            if (y > 0.0) {
                return Math.PI/2;
            } else if (y < 0.0) {
                return -Math.PI/2;
            } else {
                return Number.NaN;
            }
        } else {
            return Number.NaN;
        }
    }

    FastTrig._setDefaultValues = function (params) {
        var functionNames = ["nbSin", "nbCos", "nbAtan"];
        for (var i = functionNames.length - 1; i >= 0; i--) {
            var key = functionNames[i];
            params[key] = params[key] || params.resolution;
        }
    };

    FastTrig._fillAtanCache = function (array, factor, min) {
        for (var i = 0; i < array.length; i++) {
            var tan = min + i / factor;
            array[i] = Math.atan(tan);
        }
    };

    FastTrig._fillCache = function (array, factor, mathFunction) {
        var length = array.length;
        for (var i = 0; i < length; i++) {
            array[i] = mathFunction(i / factor);
        }
    };

    FastTrig._assign = function (dst, src1, src2, etc) {
        return [].reduce.call(arguments, function (dst, src) {
            src = src || {};
            for (var k in src) {
                if (src.hasOwnProperty(k)) {
                    dst[k] = src[k];
                }
            }
            return dst;
        }, dst || {});
    };

    return FastTrig;
}));